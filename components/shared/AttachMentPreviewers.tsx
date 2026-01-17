/* eslint-disable react-native/no-inline-styles */
import { API } from "@/api/api";
import { Attachment } from "@/api/types";
import { useWindowQuery } from "@/hooks/useWindowQuery";
import * as React from "react";
import {
  View,
  Image,
  StyleProp,
  ViewStyle,
  Text,
  TouchableOpacity,
} from "react-native";
import { FlexGrid, ResponsiveGrid } from "react-native-flexible-grid/src/index";
import { calcResponsiveGrid } from "react-native-flexible-grid/src/responsive-grid/calc-responsive-grid";
import { Portal, Modal } from "react-native-paper";
import { ReactNativeZoomableView } from "@openspacelabs/react-native-zoomable-view";
import { entries, groupBy, map, pipe, reduce, shuffle, values } from "remeda";
import { memo } from "react";
function mapStringToNumber(str: string, min: number, max: number): number {
  let sum = 0;
  for (const char of str) {
    sum += char.charCodeAt(0); // Sum ASCII values
  }
  return min + (sum % (max - min + 1)); // Map to range
}

function RenderItem({ item }) {
  const { width, height } = useWindowQuery();
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    Image.getSize(
      item.imageUrl,
      (width, height) => {
        setDimensions({ width, height });
      },
      (error) => {
        console.error("Failed to get image size", error);
      }
    );
  }, [item.imageUrl]);
  const { vHeight, vWidth } = React.useMemo(() => {
    return {
      vWidth: Math.min(dimensions.width, width * 0.8),
      vHeight: Math.min(dimensions.height, height * 0.8),
    };
  }, [item.imageUrl, dimensions, width]);
  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              flexShrink: 1,
              height: vHeight,
              width: vWidth,
              backgroundColor: "black",
            }}
          >
            <ReactNativeZoomableView
              maxZoom={30}
              contentWidth={vWidth}
              contentHeight={vHeight}
            >
              <Image
                style={{ width: "100%", height: "100%", resizeMode: "contain" }}
                source={{ uri: item.imageUrl }}
              />
            </ReactNativeZoomableView>
          </View>
        </Modal>
      </Portal>
      <TouchableOpacity
        style={{
          flex: 1,
          margin: 4,
        }}
        onPress={() => setVisible(true)}
      >
        <Image
          source={{ uri: item.imageUrl }}
          style={{
            width: "100%",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 15,
          }}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </>
  );
}
export function MasonryPreviewer({
  attachments,
}: {
  attachments: Attachment[];
}) {
  // const [k, sk] = React.useState(0.16571804411133728);

  const getData = (maxi) => {
    const withoutParams = (url: string) => url.replace(/\?.*$/, "");
    const tileItems = attachments.map((v) => ({
      imageUrl: API.url(v.url),
      widthRatio: mapStringToNumber(withoutParams(v.url), 1, maxi - 1),
      heightRatio: mapStringToNumber(withoutParams(v.url), 2, 4),
    }));
    function fixTileRatios(calcr: any[]) {
      const rows: any[][] = pipe(
        calcr,
        groupBy((v) => v.top),
        values
      );
      const rowWidths = map(rows, (_v) =>
        reduce(_v, (a, v) => a + v.widthRatio, 0)
      );
      const cols: any[][] = pipe(
        calcr,
        groupBy((v) => v.left),
        values
      );
      const colHeights = map(cols, (_v) =>
        reduce(_v, (a, v) => a + v.heightRatio, 0)
      );
      rowWidths.forEach((v, i) => {
        const wDiff = Math.max(...rowWidths) - v;
        if (wDiff > 0) {
          rows[i].at(-1).widthRatio += wDiff;
        }
      });
      colHeights.forEach((v, i) => {
        const hDiff = Math.max(...colHeights) - v;
        if (hDiff > 0) {
          const relatedRow = rows.find((v) => v.includes(cols[i][0]))!;
          const shortestLastRowItem = relatedRow.find(
            (v) =>
              v.heightRatio ==
              Math.min(...map(relatedRow, (v) => v.heightRatio))
          );
          relatedRow.length == 1
            ? (shortestLastRowItem.heightRatio += hDiff)
            : relatedRow.forEach(
                (e) => (e.heightRatio = shortestLastRowItem.heightRatio)
              );
        }
      });
      return calcr;
    }
    let res;
    for (let i = 0; i < 1; i++) {
      res = fixTileRatios(
        res ? res : calcResponsiveGrid(tileItems, maxi, 375, 80, true).gridItems
      );
    }
    return res;
  };

  const hhh = React.useRef();
  React.useEffect(() => {
    // window.sk = (b) => sk(b ?? Math.random());
    // clearInterval(hhh.current);
    // hhh.current = setInterval(() => {
    // }, 3000);
  }, []);
  const { isMobile } = useWindowQuery(800);
  const maxItem = React.useMemo(() => {
    return isMobile ? 3 : 7; //even numbers will break the layout.check
  }, [isMobile]);

  return attachments.length ? (
    <ResponsiveGrid
      // key={k}
      maxItemsPerColumn={maxItem}
      data={getData(maxItem)}
      renderItem={({ item }) => <RenderItem {...{ item }}></RenderItem>}
      itemUnitHeight={45}
      style={{
        padding: 1,
      }}
      showScrollIndicator={false}
    />
  ) : null;
}

export function HorizonTalScrollingPreviewer({
  attachments,
}: {
  attachments: Attachment[];
}) {
  const data = () => {
    const tileItems = attachments.map((v) => ({
      imageUrl: API.url(v.url),
      widthRatio: 1,
      heightRatio: 1,
    }));
    return tileItems;
  };
  const szUnit = 80;
  return attachments.length ? (
    <>
      <FlexGrid
        maxColumnRatioUnits={attachments.length}
        itemSizeUnit={szUnit}
        data={data(3)}
        renderItem={({ item }) => <RenderItem {...{ item }}></RenderItem>}
        showScrollIndicator={false}
        style={{
          minHeight: szUnit,
          maxWidth:
            (attachments.length == 1
              ? 1
              : Math.min(attachments.length / 2, 4)) * szUnit,
          backgroundColor: "black",
          borderRadius: 15,
        }}
        itemContainerStyle={{
          padding: 2,
        }}
      />
    </>
  ) : null;
}
export const MemizedHorizonTalScrollingPreviewer = memo(
  HorizonTalScrollingPreviewer,
  (prev, next) => prev.attachments.length === next.attachments.length
);