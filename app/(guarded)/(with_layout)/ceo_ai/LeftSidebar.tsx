'use dom';

import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
// --- ADDITION: ReactDOM is required for portals ---
import ReactDOM from 'react-dom';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, useWindowDimensions, Platform } from 'react-native';
import CustomIcon from '@/components/custom_icon/CustomIcon';
import { moderateScale, verticalScale } from 'react-native-size-matters';
import PopUp from './pop_up';
import { AiConfig } from '@/api/types';
import { entries, groupByProp } from 'remeda';
import { useFonts } from 'expo-font';
import 'blaze-slider/dist/blaze.css';
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import WelcomeScreen from './welcome_screen';
import ContextSettingsModal from './ContextSettingsModal';
import { useAuthManager } from '@/hooks/useAuthManager';
import { API } from '@/api/api';
import { UTIL } from '@/lib/utils';

interface StoredData {
  question: string;
  answer: string;
  coursePublicId: string | null;
}

interface Wizard {
  wizardId: number;
  wizardCode: string;
  coursePublicId: string;
  courseName: string;
  iconUrl: string;
  createdAt: string;
}

const isMobileWeb = () => {
  if (typeof window !== 'undefined') {
    return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent)
      || window.innerWidth < 768;
  }
  return false;
};

const getButtonWidth = () => {
  if (Platform.OS === 'web') {
    if (isMobileWeb()) {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 360) return 140;
      if (screenWidth <= 430) return 145;
      if (screenWidth <= 576) return 150;
      return 150;
    }
    return UTIL.vwToPx('8vw');
  } else {
    const { width } = Dimensions.get('window');
    return Math.max(120, Math.min(width * 0.5, 220));
  }
};

const getButtonHeight = () => {
  if (Platform.OS === 'web') {
    if (isMobileWeb()) {
      const screenHeight = window.innerHeight;
      if (screenHeight < 600) return 66;
      if (screenHeight < 800) return 90;
      if (screenHeight < 1090) return 90;
      return 85;
    }
    return '9vh';
  } else {
    const { height } = Dimensions.get('window');
    return Math.max(48, Math.min(height * 0.08, 90));
  }
};

function HighlightedButton({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  const [active, setActive] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const showHighlight = active || hover;
  const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
  const [imgError, setImgError] = React.useState(false);
  const isMobile = isMobileWeb();

  return (
    <div
      style={{
        borderRadius: 12,
        padding: 0,
        width: getButtonWidth(),
        minHeight: getButtonHeight(),
        flexShrink: 0,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        marginRight: 8,
        marginTop: 10,
        marginLeft: 6,
        background: showHighlight
          ? 'linear-gradient(90deg, #32646B 0%, #1F282B 60%, #232527 60%, #1D1F21 100%)'
          : 'linear-gradient(90deg, #202224 0%, #1C1D1F 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -1,
          zIndex: -1,
          borderRadius: 'inherit',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 66%, rgba(255,255,255,0.05) 10%)',
        }}
      />
      <div
        onClick={onClick}
        onMouseDown={() => setActive(true)}
        onMouseUp={() => setActive(false)}
        onMouseLeave={() => { setActive(false); setHover(false); }}
        onMouseEnter={() => setHover(true)}
        style={{
          borderRadius: 12,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          position: 'relative',
          background: 'transparent',
          cursor: 'pointer',
        }}
      >
        {showHighlight && (
          <div
            style={{
              position: 'absolute',
              left: 1,
              top: '25%',
              bottom: '25%',
              width: 5,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
              background: 'linear-gradient(180deg, #00EAFF 0%, #00EAFF 100%)',
              boxShadow: '0 0 8px #00EAFF88',
              zIndex: 20,
            }}
          />
        )}
        {isWeb && !imgError ? (
          <img
            src={icon}
            alt="icon"
            style={{ width: 45, height: 45, marginTop: 2, marginBottom: 3, objectFit: 'contain' }}
            onError={() => setImgError(true)}
          />
        ) : imgError ? (
          <CustomIcon name="plugin" size={40} color="#fff" />
        ) : (
          <Image
            source={{ uri: icon }}
            style={{ width: 45, height: 45, marginTop: 2, marginBottom: 4, resizeMode: 'contain' }}
            onError={() => setImgError(true)}
          />
        )}

        <span style={{
          color: '#ffffff',
          fontSize: isMobile ? 13.5 : 14.5,
          fontFamily: 'InterDisplay-Regular',
          marginBottom: isMobile ? 4 : 8
        }}>{label}</span>
      </div>
    </div>
  );
}


// ==================================================================
// START OF MODIFICATIONS
// ==================================================================

/**
 * An intelligent, viewport-aware, glassmorphic tooltip that renders in a portal.
 * - On Desktop: Follows the mouse cursor.
 * - On Mobile: Anchors itself above the target element, staying within screen bounds.
 */
function GlassmorphicTooltip({
  text,
  visible,
  isMobile,
  mousePosition,
  anchorRef
}: {
  text: string;
  visible: boolean;
  isMobile: boolean;
  mousePosition: { x: number, y: number };
  anchorRef: React.RefObject<HTMLDivElement>;
}) {
  const [isClient, setIsClient] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null); // Ref to measure the tooltip itself
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useLayoutEffect(() => {
    if (!visible || !anchorRef.current || !tooltipRef.current) return;

    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      padding: '10px 18px',
      borderRadius: '10px',
      color: '#F0F0F0',
      fontSize: '14px',
      fontFamily: 'Inter-Medium',
      zIndex: 9999,
      pointerEvents: 'none',
      transition: 'opacity 0.2s ease-in-out',
      opacity: 1,

      // --- USER'S REQUESTED STYLE ---
      background: 'rgba(30, 30, 32, 0.1)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37)',

      maxWidth: '280px',
      whiteSpace: 'normal',
      textAlign: 'center',
      lineHeight: '1.4',
    };

    if (isMobile) {
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportPadding = 10;

      // Position tooltip above the anchor element
      const top = anchorRect.top - tooltipRect.height - 10;

      // Center the tooltip horizontally relative to the anchor
      let left = anchorRect.left + (anchorRect.width / 2) - (tooltipRect.width / 2);

      // --- Viewport clamping logic to prevent overflow ---
      if (left < viewportPadding) {
        left = viewportPadding; // Clamp to the left edge
      }
      if (left + tooltipRect.width > window.innerWidth - viewportPadding) {
        left = window.innerWidth - tooltipRect.width - viewportPadding; // Clamp to the right edge
      }

      setStyle({ ...baseStyle, top: `${top}px`, left: `${left}px` });

    } else {
      // Desktop: Follows the mouse
      setStyle({
        ...baseStyle,
        top: `${mousePosition.y}px`,
        left: `${mousePosition.x}px`,
        transform: 'translate(15px, 15px)', // Offset from the cursor
      });
    }

  }, [visible, isMobile, mousePosition, anchorRef]);

  if (!isClient) {
    return null;
  }

  // Render invisibly first to measure, then update style with useLayoutEffect
  return ReactDOM.createPortal(
    <div ref={tooltipRef} style={{ ...style, opacity: visible ? 1 : 0 }}>
      {text}
    </div>,
    document.body
  );
}

function ModuleButton({ icon, text, onClick, buttonData, disabled }: { icon: string; text: string; onClick?: () => void; buttonData?: AiConfig['contentGenerators'][number], disabled?: boolean }) {
  const [active, setActive] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const [showTooltip, setShowTooltip] = React.useState(false);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });
  const showHighlight = active || hover;
  const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
  const [imgError, setImgError] = React.useState(false);

  const buttonRef = React.useRef<HTMLDivElement>(null);
  const isMobile = isMobileWeb();

  const tooltipMessage = "You need to fill all the wizards or fill data manually from the settings icon";

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <div
        ref={buttonRef} // Attach ref for positioning
        style={{
          borderRadius: 12,
          padding: 0,
          width: getButtonWidth(),
          minHeight: getButtonHeight(),
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
          marginLeft: 1,
          background: showHighlight && !disabled
            ? 'linear-gradient(90deg, #32646B 0%, #1F282B 60%, #232527 60%, #1D1F21 100%)'
            : 'linear-gradient(90deg, #202224 0%, #1C1D1F 100%)',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={() => {
          if (disabled) {
            setShowTooltip(true);
          } else {
            setHover(true);
          }
        }}
        onMouseLeave={() => {
          setActive(false);
          setHover(false);
          setShowTooltip(false);
        }}
        onMouseMove={!isMobile && disabled ? handleMouseMove : undefined}
      >
        <div
          style={{
            position: 'absolute',
            inset: -1,
            zIndex: -1,
            borderRadius: 'inherit',
            background: disabled ? '#272727' : 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 66%, rgba(255,255,255,0.05) 10%)',
          }}
        />
        <div
          onClick={() => !disabled && onClick && buttonData && onClick()}
          onMouseDown={() => !disabled && setActive(true)}
          onMouseUp={() => setActive(false)}
          style={{
            borderRadius: 12,
            width: '100%',
            height: '110%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            position: 'relative',
            background: 'transparent',
            padding: '12px'
          }}
        >
          {showHighlight && !disabled && (
            <div
              style={{
                position: 'absolute',
                left: 1,
                top: '25%',
                bottom: '25%',
                width: 5,
                borderTopRightRadius: 12,
                borderBottomRightRadius: 12,
                background: 'linear-gradient(180deg, #00EAFF 0%, #00EAFF 100%)',
                boxShadow: '0 0 8px #00EAFF88',
                zIndex: 20,
              }}
            />
          )}
          {isWeb && !imgError ? (
            <img
              src={icon}
              alt="icon"
              style={{ width: 40, height: 40, marginTop: 2, marginBottom: 2, objectFit: 'contain' }}
              onError={() => setImgError(true)}
            />
          ) : imgError ? (
            <CustomIcon name="plugin" size={25} color="#fff" />
          ) : (
            <Image
              source={{ uri: icon }}
              style={{ width: 40, height: 40, marginTop: 2, marginBottom: 2, resizeMode: 'contain' }}
              onError={() => setImgError(true)}
            />
          )}

          <span style={{
            color: '#ffffff',
            fontSize: isMobile ? 12 : 14.5,
            fontFamily: 'InterDisplay-Regular',
            marginTop: 2,
            marginBottom: 8,
            textAlign: 'center',
          }}>{text}</span>
        </div>
      </div>
      <GlassmorphicTooltip
        text={tooltipMessage}
        visible={showTooltip}
        isMobile={isMobile}
        mousePosition={tooltipPosition}
        anchorRef={buttonRef}
      />
    </>
  );
}
// ==================================================================
// END OF MODIFICATIONS
// ==================================================================


export default function LeftSidebar({ buttons, courseId, onContentGenerate, onWizardComplete, setCurrentScreen }: { buttons: AiConfig['contentGenerators']; courseId: string; onContentGenerate?: (button: AiConfig['contentGenerators'][number]) => void; onWizardComplete?: (wizardCode: string) => void; setCurrentScreen?: (screen: 'leftSidebar' | 'aiReply' | 'taskTracker') => void }) {
  const [showWizardModal, setShowWizardModal] = React.useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = React.useState(false);
  const [selectedWizardId, setSelectedWizardId] = React.useState<number | null>(null);
  const [showContextModal, setShowContextModal] = React.useState(false);
  const { activeUser } = useAuthManager();

  const [studentDataContext, setStudentDataContext] = useState<Map<string, string>>(new Map());
  const [buttonDisabledStatus, setButtonDisabledStatus] = useState<Map<number, boolean>>(new Map());
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const refreshButtonStates = useCallback(async () => {
    if (!activeUser?.publicId || !courseId) {
      setIsCheckingStatus(false);
      return;
    }

    console.log('--- Refreshing LeftSidebar button states... ---');
    setIsCheckingStatus(true);
    try {
      const response = await fetch(`${API.AI_BASE_URL}/stored-wizard-data/by-student/${activeUser.publicId}`, { headers: API.authHeaders() });
      if (!response.ok) {
        throw new Error('Failed to fetch student context data');
      }
      const allData: StoredData[] = await response.json();

      const dataMap = new Map<string, string>();
      const relevantData = allData.filter(d => d.coursePublicId === courseId);

      for (const item of relevantData) {
        if (item.question && item.answer) {
          dataMap.set(item.question, item.answer);
        }
      }
      setStudentDataContext(dataMap);
    } catch (error) {
      console.error('Error refreshing button states:', error);
      setStudentDataContext(new Map());
    } finally {
      setIsCheckingStatus(false);
    }
  }, [courseId, activeUser?.publicId]);

  useEffect(() => {
    refreshButtonStates();
  }, [refreshButtonStates]);

  useEffect(() => {
    if (!buttons || buttons.length === 0 || isCheckingStatus) {
      return;
    }

    const newStatusMap = new Map<number, boolean>();
    const placeholderRegex = /{([^}]+)}/g;

    for (const button of buttons) {
      let isDisabled = false;
      const requiredKeys = [...new Set(Array.from(button.promptTemplate.matchAll(placeholderRegex), m => m[1].trim()))];

      if (requiredKeys.length > 0) {
        for (const key of requiredKeys) {
          const answer = studentDataContext.get(key);
          if (!answer || answer.trim() === '') {
            isDisabled = true;
            break;
          }
        }
      }
      newStatusMap.set(button.contentGeneratorId, isDisabled);
    }

    setButtonDisabledStatus(newStatusMap);
  }, [buttons, studentDataContext, isCheckingStatus]);

  const handleWizardClick = (wizardId: number) => {
    setSelectedWizardId(wizardId);
    setShowWelcomeScreen(true);
  };

  const handleWelcomeNext = () => {
    setShowWelcomeScreen(false);
    setShowWizardModal(true);
  };

  const handleWelcomeSkip = () => {
    setShowWelcomeScreen(false);
    setShowContextModal(true);
  };

  const handleWizardBack = () => {
    setShowWizardModal(false);
    setShowWelcomeScreen(true);
  };

  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const buttonsWithTitle = buttons.map(btn => ({
    ...btn,
    chapterTitle: btn.chapter.title
  }));
  const groupedButtons = entries(groupByProp(buttonsWithTitle, "chapterTitle")).sort(
    ([, groupA], [, groupB]) => {
      const orderA = groupA[0]?.chapter?.order ?? 0;
      const orderB = groupB[0]?.chapter?.order ?? 0;
      return orderB - orderA;
    }
  );
  const [fontsLoaded] = useFonts({
    'InterDisplay-Regular': require('@/assets/fonts/InterDisplay-Regular.ttf'),
    'InterDisplay-SemiBold': require('@/assets/fonts/InterDisplay-SemiBold.ttf'),
    'Inter-Medium': require('@/assets/fonts/Inter-Medium.ttf'),
    'IcoMoon': require('@/assets/icons/icomoon.ttf'),
  });

  const [wizards, setWizards] = useState<Wizard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sliderRef, instanceRef] = useKeenSlider({
    slides: { perView: 2, spacing: 1 },
    loop: false,
    mode: "free-snap",
  });

  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const checkScrollPosition = () => {
    if (instanceRef.current) {
      const { track } = instanceRef.current;
      setCanScrollRight(track.details.abs < track.details.maxIdx);
      setCanScrollLeft(track.details.abs > 0);
    }
  };

  const scrollNext = () => {
    if (instanceRef.current) {
      instanceRef.current.next();
    }
  };

  const scrollPrev = () => {
    if (instanceRef.current) {
      instanceRef.current.prev();
    }
  };

  useEffect(() => {
    if (instanceRef.current) {
      instanceRef.current.on("slideChanged", checkScrollPosition);
      checkScrollPosition();
    }
  }, [instanceRef, wizards]);

  useEffect(() => {
    const fetchWizards = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API.AI_BASE_URL}/courses/${courseId}/wizards`, { headers: API.authHeaders() });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: Wizard[] = await response.json();
        setWizards(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load wizards: ${errorMessage}`);
        setWizards([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWizards();
  }, [courseId]);

  if (!fontsLoaded || loading) {
    return <Text style={styles.loading}>Loading...</Text>;
  }

  const sectionTitleStyle = {
    ...styles.sectionTitle,
    fontSize: isMobile ? moderateScale(18) : moderateScale(13),
  };
  const moduleTitle = {
    ...styles.moduleTitle,
    fontSize: isMobile ? moderateScale(18) : moderateScale(13),
  }

  const sidebarContent = (
    <div style={{
      padding: 1,
      paddingTop: isMobile ? 17 : 1.5,
      borderRadius: 20,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
      width: '98%',
      height: '100%',
      marginRight: isMobile ? 0 : 12,
      marginTop: isMobile ? 85 : 12,
      marginBottom: 12,
      marginLeft: isMobile ? 0 : 12,
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #1f2123 0%, #151617 75%)',
        borderRadius: 18,
        width: '100%',
        height: '100%',
        padding: isMobile ? 5 : 2,
        marginTop: isMobile ? -15 : 0,
        alignItems: "center",
        justifyContent: "center",
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}>
        <div style={{ height: '100%', overflowY: 'auto', width: '100%', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          className="hide-scrollbar"
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebar}>
            {isMobile && <div style={{ height: 10 }} />
            }
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: moderateScale(10) }}>
              <Text style={sectionTitleStyle}></Text>
              <TouchableOpacity onPress={() => setShowContextModal(true)} style={{ padding: 5 }}>
                <CustomIcon name="setting" size={isMobile ? moderateScale(16) : moderateScale(14)} color="#00EAFF" />
              </TouchableOpacity>
            </div>
            {error ? (
              <Text style={styles.error}>{error}</Text>
            ) : wizards.length === 0 ? (
              <Text style={styles.empty}>No wizards available</Text>
            ) : (
              <div style={{ position: 'relative', marginBottom: 12 }}>
                {canScrollLeft && (
                  <div
                    onClick={scrollPrev}
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      zIndex: 10,
                    }}
                  >
                    <CustomIcon name="arrow-left-2" size={40} color="#00EAFF" />
                  </div>
                )}
                <div
                  ref={sliderRef}
                  className="keen-slider hide-scrollbar"
                >
                  {wizards.map((wizard) => (
                    <div key={wizard.wizardId} className="keen-slider__slide" style={{ flex: `0 0 ${getButtonWidth()}px`, minWidth: getButtonWidth() }}>
                      <HighlightedButton
                        icon={wizard.iconUrl}
                        label={wizard.wizardCode}
                        onClick={() => handleWizardClick(wizard.wizardId)}
                      />
                    </div>
                  ))}
                </div>
                {canScrollRight && (
                  <div
                    onClick={scrollNext}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      zIndex: 10,
                    }}
                  >
                    <CustomIcon name="arrow-right-2" size={40} color="#00EAFF" />
                  </div>
                )}
              </div>
            )}
            <View style={styles.divider} />
            {groupedButtons.map(([module, buttons]) => (
              <React.Fragment key={module}>
                <Text style={styles.moduleTitle}>{module}</Text>
                <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', gap: '18px', justifyContent: 'flex-start', marginBottom: 6, marginTop: 15, marginLeft: 4 }}>
                  {buttons.map((button, idx) => (
                    <ModuleButton
                      key={idx}
                      icon={button?.buttonIconUrl ?? 'ic_Friends'}
                      text={button.buttonName}
                      disabled={buttonDisabledStatus.get(button.contentGeneratorId) ?? true}
                      onClick={() => {
                        if (isMobile && setCurrentScreen) {
                          setCurrentScreen('aiReply');
                        }
                        onContentGenerate && onContentGenerate(button);
                      }}
                      buttonData={button}
                    />
                  ))}
                </div>
              </React.Fragment>
            ))}
          </ScrollView>
        </div>
      </div>
      {showWelcomeScreen && selectedWizardId !== null && (
        <WelcomeScreen
          onClose={() => setShowWelcomeScreen(false)}
          onNext={handleWelcomeNext}
          onSkip={handleWelcomeSkip}
          courseId={courseId}
        />
      )}
      {showWizardModal && selectedWizardId !== null && (
        <PopUp
          onClose={() => setShowWizardModal(false)}
          wizardId={selectedWizardId}
          onBack={handleWizardBack}
          onWizardComplete={() => {
            const wizard = wizards.find(w => w.wizardId === selectedWizardId);
            if (wizard && onWizardComplete) {
              onWizardComplete(wizard.wizardCode);
            }
            setShowWizardModal(false);
            refreshButtonStates();
          }}
        />
      )}
      {showContextModal && activeUser?.publicId && (
        <ContextSettingsModal
          onClose={() => setShowContextModal(false)}
          courseId={courseId}
          onDataUpdated={() => {
            setShowContextModal(false);
            refreshButtonStates();
          }}
        />
      )}
    </div>
  );

  return isMobile ? (
    <div style={{ padding: 10, height: '100dvh', boxSizing: 'border-box', background: '#111' }}>
      <div style={{ height: '100%', overflowY: 'auto' }} className="hide-scrollbar">
        {sidebarContent}
      </div>
    </div>
  ) : (
    sidebarContent
  );
}

const styles = StyleSheet.create({
  sidebar: {
    flex: 1,
    flexDirection: 'column',
    padding: moderateScale(5),
    width: '100%',
    height: '100%',
    position: 'relative',
    zIndex: 1,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter-Medium',
    marginLeft: moderateScale(2),
    marginTop: moderateScale(10),
    marginBottom: moderateScale(12),
    letterSpacing: 0.5,
  },
  divider: {
    height: moderateScale(1),
    backgroundColor: '#FFFFFF1A',
    marginBottom: moderateScale(12),
  },
  moduleTitle: {
    color: '#FFFFFF',
    fontSize: moderateScale(12),
    fontFamily: 'Inter-Medium',
    marginLeft: moderateScale(2),
    marginTop: moderateScale(10),
    letterSpacing: 0.5,
    marginBottom: moderateScale(12),
  },
  loading: {
    color: '#FFFFFF',
    fontSize: moderateScale(13),
    textAlign: 'center',
    marginTop: moderateScale(20),
  },
  error: {
    color: '#D22A38',
    fontSize: moderateScale(12),
    textAlign: 'center',
    marginTop: moderateScale(10),
  },
  empty: {
    color: '#888',
    fontSize: moderateScale(12),
    textAlign: 'center',
    marginTop: moderateScale(10),
  },
});

if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `;
  document.head.appendChild(style);
}