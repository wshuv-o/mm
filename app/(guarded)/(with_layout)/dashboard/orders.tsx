import React, { useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet, ScrollView } from "react-native";
import { moderateScale } from "react-native-size-matters";
import CustomIcon from "@/components/custom_icon/CustomIcon";
import { Dropdown } from "react-native-element-dropdown";
import { useWindowQuery } from "@/hooks/useWindowQuery";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/api/api";
import { FullPageLoader } from "@/components/shared/FullPageLoader";
import {
  addMonths,
  format,
  isBefore,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { UTIL } from "@/lib/utils";
import { uniqueBy } from "remeda";

export default function OrdersScreen() {
  const { isMobile } = useWindowQuery(768);
  const { isPending, data } = useQuery({
    queryKey: ["user_payments"],
    queryFn: API.listPayments,
  });
  const [filter, setFilter] = useState(0);
  const filters = useMemo(
    () =>
      uniqueBy(
        [{ label: "All", value: 0 }].concat(
          data?.reduce((p, value, i) => {
            const start = parseISO(value.createdAt);
            if (!i && isBefore(start, p.at(-1))) {
              return p;
            }
            const end = addMonths(start, 3);
            return [
              ...p,
              {
                label: `${format(start, "d MMM yy")} - ${format(
                  end,
                  "d MMM yy"
                )}`,
                value: i + 1,
                range: { start, end },
              },
            ];
          }, []) ?? []
        ),
        (v) => v.label
      ),
    [data]
  );
  const orderData = useMemo(
    () =>
      data
        ?.map((v) => {
          return {
            packageName: v.package?.label ?? "--",
            date: format(v.createdAt, "MMM dd, yyyy"),
            originalDate: parseISO(v.createdAt),
            id: v.publicId,
            //FIXME - currency shouild not be hard coded
            price: "₹" + v.amount,
            status: v.status,
          };
        })
        ?.filter(
          (v) =>
            !filter || isWithinInterval(v.originalDate, filters[filter].range)
        ) ?? [],
    [data, filter]
  );
  const renderMobileView = () => (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Order History</Text>
        </View>

        <View style={styles.dropdownWrapper}>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownText}
            data={filters}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={filters[0].label}
            value={filter}
            onChange={(val) => setFilter(val.value)}
            renderRightIcon={() => (
              <CustomIcon
                name="ic_Dropdown"
                size={moderateScale(14)}
                color="#92929D"
                style={styles.icon}
              />
            )}
            renderItem={(item) => (
              <View style={styles.dropdownItem}>
                <CustomIcon
                  name="ic_Dropdown"
                  size={moderateScale(12)}
                  color="#92929D"
                  style={styles.icon}
                />
                <Text style={styles.dropdownItemText}>{item.label}</Text>
              </View>
            )}
          />
        </View>
        <FlatList
          data={orderData}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Package:</Text>
                <Text style={styles.value}>
                  {UTIL.truncateTxt(item.packageName, 20)}
                </Text>
              </View>

              <View style={styles.labelRow}>
                <Text style={styles.label}>Date:</Text>
                <Text style={styles.value}>{item.date}</Text>
              </View>

              <View style={styles.labelRow}>
                <Text style={styles.label}>Price:</Text>
                <Text style={styles.value}>{item.price}</Text>
              </View>

              <View style={styles.labelRow}>
                <Text style={styles.label}></Text>
                <View style={styles.statusContainer}>
                  <Text style={styles.status}>{item.status}</Text>
                  {/* there is no invoicing functionality in the app */}
                  {/* <TouchableOpacity style={styles.actionButton}>
                    <CustomIcon
                      name="invoice"
                      size={moderateScale(14)}
                      color="#D22A38"
                      style={styles.icon}
                    />
                  </TouchableOpacity> */}
                </View>
              </View>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );

  const renderWebView = () => (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Order History</Text>
        </View>

        <View style={styles.webTabRow}>
          <View style={styles.webDateRangeContainer}>
            <Text style={styles.webDateRangeLabel}>Date Range: </Text>
            <View style={styles.dropdownWrapperWeb}>
              <Dropdown
                style={styles.dropdownWeb}
                placeholderStyle={styles.dropdownPlaceholderWeb}
                selectedTextStyle={styles.dropdownTextWeb}
                data={filters}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={filters[0].label}
                onChange={(val) => setFilter(val.value)}
                value={filter}
                renderRightIcon={() => (
                  <CustomIcon
                    name="ic_Dropdown"
                    size={moderateScale(12)}
                    color="#92929D"
                  />
                )}
              />
            </View>
          </View>
        </View>

        <View style={styles.webTableHeader}>
          <Text style={[styles.webHeaderCell, { flex: 2 }]}>
            Package
          </Text>
          <Text style={[styles.webHeaderCell, { flex: 1 }]}>Date</Text>
          <Text style={[styles.webHeaderCell, { flex: 1 }]}>Price</Text>
          <Text style={[styles.webHeaderCell, { flex: 1 }]}>Status</Text>
          <Text style={[styles.webHeaderCell, { flex: 1 }]} />
        </View>

        {orderData.map((item, index) => (
          <View style={styles.webTableRow} key={index}>
            <Text style={[styles.webRowCell, { flex: 2 }]}>
              {item.packageName}
            </Text>
            <Text style={[styles.webRowCell, { flex: 1 }]}>{item.date}</Text>
            <Text style={[styles.webRowCell, { flex: 1 }]}>{item.price}</Text>
            <View style={[styles.webRowCell, { flex: 1 }]}>
              <Text style={styles.status}>{item.status}</Text>
            </View>
            {/* <View style={[styles.webRowCell, { flex: 1 }]}>
              <TouchableOpacity style={styles.actionButton}>
                <CustomIcon
                  name="invoice"
                  size={moderateScale(14)}
                  color="#D22A38"
                />
              </TouchableOpacity>
            </View> */}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return isPending ? (
    <FullPageLoader></FullPageLoader>
  ) : isMobile ? (
    renderMobileView()
  ) : (
    renderWebView()
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#141414",
    padding: moderateScale(10),
    flexGrow: 1,
  },

  card: {
    backgroundColor: "#1C1C1C",
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: "#282828",
    padding: moderateScale(12),
    marginTop: moderateScale(5),
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScale(12),
  },
  title: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#FAFAFB",
    // fontFamily: "poppins",
    textAlign: "center",
  },
  icon: {
    marginRight: moderateScale(4),
  },

  dropdownWrapper: {
    marginBottom: moderateScale(10),
    backgroundColor: "#252525",
    borderRadius: moderateScale(8),
    padding: moderateScale(10),
  },
  dropdown: {
    height: moderateScale(12),
    width: "100%",
    borderColor: "#282828",
    backgroundColor: "#252525",
    borderWidth: 1,
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(12),
  },
  dropdownPlaceholder: {
    fontSize: moderateScale(8),
    fontWeight: "400",
    fontFamily: "poppins",
    color: "#D5D5DC",
  },
  dropdownText: {
    fontSize: moderateScale(12),
    color: "#D5D5DC",
  },
  dropdownItem: {
    padding: moderateScale(4),
    borderBottomWidth: 1,
    borderColor: "#282828",
    backgroundColor: "#252525",
  },
  dropdownItemText: {
    fontSize: moderateScale(8),
    fontWeight: "500",
    fontFamily: "poppins",
    color: "#FAFAFB",
  },
  orderCard: {
    backgroundColor: "#252525",
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
    marginBottom: moderateScale(12),
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: moderateScale(4),
  },
  label: {
    fontSize: moderateScale(12),
    fontWeight: "400",
    fontFamily: "poppins",
    color: "#808080",
  },
  value: {
    fontSize: moderateScale(12),
    fontWeight: "400",
    fontFamily: "poppins",
    color: "#FAFAFB",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: moderateScale(8),
  },
  status: {
    fontSize: moderateScale(10),
    fontWeight: "400",
    fontFamily: "poppins",
    color: "#32A54B",
    backgroundColor: "#32A54B33",
    // paddingHorizontal: moderateScale(15),
    textAlign: "center",
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(4),
  },
  actionButton: {
    marginLeft: moderateScale(10),
    borderRadius: moderateScale(4),
  },

  // -----www
  webTabRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: moderateScale(10),
    marginLeft: moderateScale(20),
  },
  webTabButton: {
    marginRight: moderateScale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  webTabText: {
    fontSize: moderateScale(10),
    color: "#92929D",
    fontFamily: "poppins",
    marginBottom: moderateScale(2),
  },
  webTabActiveText: {
    color: "#FAFAFB",
    // color:'#E53935',
    paddingLeft: 39,
    paddingRight: 39,
    fontWeight: "600",
  },
  webTabActiveBar: {
    height: moderateScale(2),
    width: "100%",
    backgroundColor: "#E53935",
  },
  webDateRangeContainer: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "center",
  },
  webDateRangeLabel: {
    fontSize: moderateScale(10),
    color: "#92929D",
    marginRight: moderateScale(8),
    fontFamily: "poppins",
  },
  dropdownWrapperWeb: {
    width: moderateScale(180),
  },
  dropdownWeb: {
    height: moderateScale(28),
    borderColor: "#282828",
    backgroundColor: "#252525",
    borderWidth: 1,
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(12),
    justifyContent: "center",
  },
  dropdownPlaceholderWeb: {
    fontSize: moderateScale(10),
    color: "#D5D5DC",
  },
  dropdownTextWeb: {
    fontSize: moderateScale(10),
    color: "#D5D5DC",
  },

  webTableHeader: {
    flexDirection: "row",
    backgroundColor: "#252525",
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(8),
    // borderRadius: moderateScale(6),
    marginBottom: moderateScale(6),
  },
  webHeaderCell: {
    fontSize: moderateScale(12),
    color: "#92929D",
    // fontFamily: "poppins",
    fontWeight: "500",
    alignContent: "center",
  },
  webTableRow: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(8),
    marginBottom: moderateScale(2),
    // borderRadius: moderateScale(6),
    borderBottomWidth: 1,
    borderColor: "#282828",
  },
  webRowCell: {
    fontSize: moderateScale(10),
    color: "#FAFAFB",
    // fontFamily: "poppins",
  },
});
