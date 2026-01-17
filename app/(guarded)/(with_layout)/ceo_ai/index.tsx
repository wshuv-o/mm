// G:\finishing\ceo_ai_frontend\app\(guarded)\(with_layout)\ceo_ai\index.tsx
import React, { useState, ReactNode, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, ScrollView, Image, useWindowDimensions, Platform, Dimensions, Alert } from 'react-native';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import {
    scale,
    verticalScale,
    moderateScale,
    moderateVerticalScale
} from 'react-native-size-matters';
import { useWindowQuery } from '@/hooks/useWindowQuery';
import CustomIcon from '@/components/custom_icon/CustomIcon';
import { router, useGlobalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthManager } from '@/hooks/useAuthManager';
import { API } from '@/api/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FullPageLoader } from '@/components/shared/FullPageLoader';
import ObjectionBIcon from '@/assets/images/objectionB.svg';
import { generateContent } from '@/api/contentGen';
import { generateObjectionOnly } from '@/api/objectionOnly';
import Markdown from 'react-native-markdown-display';
import * as Clipboard from 'expo-clipboard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Hook to get window height and update on resize
function useWindowHeight() {
    const [height, setHeight] = useState(
        typeof window !== 'undefined' ? window.innerHeight : 900
    );
    useEffect(() => {
        function handleResize() {
            setHeight(window.innerHeight);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return height;
}

// Replace useResponsiveChatHeight with useFullScreenChatHeight
function useFullScreenChatHeight(headerHeight = 0) {
    const [height, setHeight] = useState(
        typeof window !== 'undefined' ? window.innerHeight : 900
    );
    useEffect(() => {
        function handleResize() {
            setHeight(window.innerHeight);
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    // Decrease the height and set marginTop to a less negative value
    return { height: height * 0.75 - headerHeight, marginbottom: 40 };
}

// Responsive hook-based solution for chat SVG area
function useResponsiveChatHeight() {
    const [dimensions, setDimensions] = useState({
        height: typeof window !== 'undefined' ? window.innerHeight : 900,
        width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    });

    useEffect(() => {
        function handleResize() {
            setDimensions({
                height: window.innerHeight,
                width: window.innerWidth,
            });
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate responsive height based on both width and height
    const getChatSvgStyle = () => {
        const { height, width } = dimensions;
        const aspectRatio = width / height;
        let heightPercentage = 0.8; // Default 60%
        let marginPercentage = -0.15; // Default -15%
        if (aspectRatio > 1.8) { // Ultra-wide screens
            heightPercentage = 0.65;
            marginPercentage = -0.2;
        } else if (aspectRatio < 1.3) { // Taller screens
            heightPercentage = 0.55;
            marginPercentage = -0.9;
        }
        return {
            height: Math.max(height * heightPercentage, 290), // Minimum height 400px
            marginTop: Math.max(height * marginPercentage, -280), // Maximum negative margin -150px
        };
    };
    return getChatSvgStyle();
}

// Responsive chat SVG style for both web and native
function useResponsiveChatSvgStyle() {
    if (Platform.OS === 'web') {
        // Web: use vh units and string values
        //daksh svg size and gap
        return {
            height: '70vh',
            width: '95%',
        };
    } else {
        // Native: use Dimensions
        const { height } = Dimensions.get('window');
        return {
            height: height * 0.8,
            width: '95%',
        };
    }
}

type GlowButtonProps = {
    children: ReactNode;
    onPress: () => void;
    style?: any;
    iconOnly?: boolean;
    disabled?: boolean;
};

function GlowButton({ children, onPress, style, iconOnly = false, disabled = false }: GlowButtonProps) {
    const [pressed, setPressed] = useState(false);
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            onPress={onPress}
            disabled={disabled}
            style={[
                style,
                pressed && !disabled && {
                    backgroundColor: 'rgba(0,234,255,0.08)',
                    shadowColor: '#00EAFF',
                    shadowOpacity: 0.5,
                    shadowRadius: 12,
                    elevation: 8,
                    borderColor: '#00EAFF',
                    borderWidth: iconOnly ? 0 : 1,
                },
                disabled && {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                },
            ]}
        >
            {children}
        </TouchableOpacity>
    );
}

function MobileDrawer({ onNavigate }: { onNavigate: (screen: 'leftSidebar' | 'aiReply' | 'taskTracker') => void }) {
    return (
        <View style={styles.mobileDrawer}>
            <View style={styles.mobileDrawerContent}>
                <GlowButton style={styles.mobileDrawerItem} onPress={() => onNavigate('leftSidebar')}>
                    <CustomIcon name="ic_File" size={22} color="#FFFFFF" />
                    <Text style={styles.mobileDrawerItemText}>Niche</Text>
                </GlowButton>
                <GlowButton style={styles.mobileDrawerItem} onPress={() => onNavigate('aiReply')}>
                    <CustomIcon name="ic_File" size={22} color="#FFFFFF" />
                    <Text style={styles.mobileDrawerItemText}>Objection Handling</Text>
                </GlowButton>
                <GlowButton style={styles.mobileDrawerItem} onPress={() => onNavigate('taskTracker')}>
                    <CustomIcon name="ic_File" size={22} color="#FFFFFF" />
                    <Text style={styles.mobileDrawerItemText}>Task Tracker</Text>
                </GlowButton>
            </View>
        </View>
    );
}

const TypingIndicator = () => {
    const [dots, setDots] = useState('.');

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => (prev.length >= 3 ? '.' : prev + '.'));
        }, 350);
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{
                color: '#cccccc',
                fontSize: moderateScale(10.5),
                fontFamily: 'InterDisplay-Regular'
            }}>
                Thinking
            </Text>
            <Text style={{
                color: '#cccccc',
                fontSize: moderateScale(10.5),
                fontFamily: 'InterDisplay-Regular',
                minWidth: moderateScale(15),
                textAlign: 'left'
            }}>
                {dots}
            </Text>
        </View>
    );
};

function TextDisplay({ text, isMobile, conversation, scrollViewRef }: {
    text: string;
    isMobile: boolean;
    conversation: Array<{ role: 'bot' | 'user'; content: string }>;
    scrollViewRef: React.RefObject<ScrollView>
}) {
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleCopy = async (contentToCopy: string, index: number) => {
        await Clipboard.setStringAsync(contentToCopy);
        setCopiedIndex(index);
        setTimeout(() => {
            setCopiedIndex(null);
        }, 2000);
    };

    // --- STYLES OVERHAULED FOR COMPACTNESS AND CLARITY ---
    const markdownStyles = {
        body: {
            color: '#E0E0E0',
            fontSize: isMobile ? moderateScale(12) : moderateScale(10), // +2px for mobile
            fontFamily: 'InterDisplay-Regular',
            lineHeight: isMobile ? moderateScale(18) : moderateScale(16), // +2px for mobile
        },
        heading1: {
            fontSize: isMobile ? moderateScale(20) : moderateScale(18), // +2px for mobile
            fontWeight: 'bold',
            color: '#00F7FFFF',
            borderBottomWidth: 1,
            borderColor: '#00F7FF30',
            paddingBottom: moderateScale(4),
            marginBottom: moderateScale(10), // REDUCED
            marginTop: moderateScale(8),
        },
        heading2: {
            fontSize: isMobile ? moderateScale(17) : moderateScale(15), // +2px for mobile
            fontWeight: '600',
            color: '#38F2FFFF',
            marginTop: moderateScale(12), // REDUCED
            marginBottom: moderateScale(8), // REDUCED
        },
        heading3: {
            fontSize: isMobile ? moderateScale(15) : moderateScale(13), // +2px for mobile
            fontWeight: 'bold',
            color: '#A9D7FF',
            marginTop: moderateScale(10), // REDUCED
            marginBottom: moderateScale(5), // REDUCED
        },
        heading4: {
            fontSize: isMobile ? moderateScale(14) : moderateScale(12), // +2px for mobile
            fontWeight: '600',
            color: '#b0bec5', // Softer, non-italic color
            marginTop: moderateScale(8), // REDUCED
            marginBottom: moderateScale(4), // REDUCED
        },
        strong: {
            fontWeight: 'bold',
            color: '#FFFFFF',
        },
        em: {
            fontStyle: 'italic',
            color: '#A9D7FF',
        },
        link: {
            color: '#4dabf7',
            textDecorationLine: 'underline',
        },
        blockquote: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: '#00EAFF',
            borderLeftWidth: 3,
            padding: moderateScale(8),
            marginVertical: moderateScale(8),
            fontSize: isMobile ? moderateScale(12) : moderateScale(10), // +2px for mobile
            lineHeight: isMobile ? moderateScale(18) : moderateScale(16), // +2px for mobile
        },
        list_item: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: moderateScale(2), // TIGHTENED
            fontSize: isMobile ? moderateScale(12) : moderateScale(10), // +2px for mobile
            lineHeight: isMobile ? moderateScale(18) : moderateScale(16), // +2px for mobile
        },
        bullet_list_icon: {
            color: '#00EAFF',
            fontSize: isMobile ? moderateScale(16) : moderateScale(14), // +2px for mobile
            lineHeight: isMobile ? moderateScale(18) : moderateScale(16), // +2px for mobile
            marginRight: moderateScale(8),
        },
        hr: {
            backgroundColor: '#00EAFF40',
            height: 1,
            marginVertical: moderateScale(12),
        },
    };


    const botMessageStyle = {
        alignSelf: 'flex-start',
        maxWidth: '95%',
        padding: moderateScale(12),
        borderRadius: moderateScale(12),
        backgroundColor: 'rgba(45, 45, 45, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: moderateScale(8),
        marginTop: moderateScale(10),
        ...Platform.select({
            web: {
                // @ts-ignore
                backdropFilter: 'blur(10px)',
            }
        })
    };

    const userMessageStyle = {
        alignSelf: 'flex-end',
        maxWidth: '80%',
        padding: moderateScale(10), // Reduced
        borderRadius: moderateScale(12),
        backgroundColor: 'rgba(0, 122, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(0, 122, 255, 0.25)',
        marginBottom: moderateScale(8),
        ...Platform.select({
            web: {
                // @ts-ignore
                backdropFilter: 'blur(10px)',
            }
        })
    };

    const isPlaceholder = text === 'Click a content generator button to start...';

    useEffect(() => {
        if (!isMobile && (conversation.length > 0 || !isPlaceholder)) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [conversation, text, isMobile, scrollViewRef, isPlaceholder]);

    return (
        <View style={[styles.textDisplayContainer, isMobile && { top: 85 }]}>
            <ScrollView
                ref={scrollViewRef}
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                {!isPlaceholder && text && (
                    <View style={botMessageStyle}>
                        {text === 'Loading...' ? (
                            <TypingIndicator />
                        ) : (
                            <>
                                <Markdown style={markdownStyles}>{text}</Markdown>
                                <TouchableOpacity
                                    onPress={() => handleCopy(text, -1)}
                                    style={{
                                        alignSelf: 'flex-end',
                                        marginTop: moderateScale(10),
                                        paddingVertical: moderateScale(4),
                                        paddingHorizontal: moderateScale(12),
                                        borderRadius: moderateScale(16),
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        borderWidth: 1,
                                        borderColor: 'rgba(255, 255, 255, 0.15)',
                                    }}
                                >
                                    <Text style={{
                                        color: copiedIndex === -1 ? '#00EAFF' : '#ccc',
                                        fontSize: moderateScale(9),
                                        fontFamily: 'InterDisplay-Regular',
                                        fontWeight: '500',
                                    }}>
                                        {copiedIndex === -1 ? 'Copied' : 'Copy'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}

                {isPlaceholder && (
                    <Markdown style={markdownStyles}>{text}</Markdown>
                )}

                {conversation.map((msg, index) => (
                    <View key={index} style={msg.role === 'user' ? userMessageStyle : botMessageStyle}>
                        {msg.role === 'user' ? (
                            <Text style={{
                                color: '#FFFFFF',
                                fontSize: moderateScale(10.5), // REDUCED
                                fontFamily: 'InterDisplay-Regular',
                                lineHeight: moderateScale(17), // TIGHTENED
                            }}>
                                {msg.content}
                            </Text>
                        ) : (
                            <>
                                {msg.content === 'Loading...' ? (
                                    <TypingIndicator />
                                ) : (
                                    <>
                                        <Markdown style={markdownStyles}>{msg.content}</Markdown>
                                        <TouchableOpacity
                                            onPress={() => handleCopy(msg.content, index)}
                                            style={{
                                                alignSelf: 'flex-end',
                                                marginTop: moderateScale(10),
                                                paddingVertical: moderateScale(4),
                                                paddingHorizontal: moderateScale(12),
                                                borderRadius: moderateScale(16),
                                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                borderWidth: 1,
                                                borderColor: 'rgba(255, 255, 255, 0.15)',
                                            }}
                                        >
                                            <Text style={{
                                                color: copiedIndex === index ? '#00EAFF' : '#ccc',
                                                fontSize: moderateScale(9),
                                                fontFamily: 'InterDisplay-Regular',
                                                fontWeight: '500',
                                            }}>
                                                {copiedIndex === index ? 'Copied' : 'Copy'}
                                            </Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </>
                        )}
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}


function MiddleArea({ onNavigate, courseId, generatedText, conversation, scrollViewRef }: {
    onNavigate: (screen: 'leftSidebar' | 'aiReply' | 'taskTracker') => void;
    courseId: string;
    generatedText: string;
    conversation: Array<{ role: 'bot' | 'user'; content: string }>;
    scrollViewRef: React.RefObject<ScrollView>;
}) {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const AVATAR_SIZE = isMobile ? 113 : 140;
    const { activeUser } = useAuthManager();
    const userPublicId = activeUser?.publicId;

    const wizardQk = ['wizard', courseId];
    const wizardIsSuccess = useQuery({
        queryKey: wizardQk,
        queryFn: () => API.getAiConfig(courseId),
    });
    const wizardData = wizardIsSuccess.data;

    const otherQk = ['wizard', courseId];
    const otherIsSuccess = useQuery({
        queryKey: otherQk,
        queryFn: () => API.getAiConfig(courseId),
    });
    const otherData = otherIsSuccess.data;

    // Use responsive chat SVG style for desktop
    const chatSvgStyle = useResponsiveChatSvgStyle();

    return (
        <View style={styles.middleArea}>
            <View style={[styles.overlapContainer, { alignItems: 'center', flexDirection: 'column', minHeight: isMobile ? verticalScale(310) : verticalScale(120), flex: 1, justifyContent: 'center' }]}>
                <View style={[
                    styles.chatSvgArea,
                    { position: 'relative' },
                    isMobile && { height: '65%' },
                    !isMobile && Platform.OS === 'web' && { left: -5, ...chatSvgStyle },
                    !isMobile && Platform.OS !== 'web' && { left: -5, height: chatSvgStyle.height, width: chatSvgStyle.width },
                ]}>
                    <View style={{
                        position: 'absolute',
                        left: '50%',
                        transform: [{ translateX: -AVATAR_SIZE / 2 }],
                        top: isMobile ? -AVATAR_SIZE * 0.21 : -AVATAR_SIZE * 0.30,
                        width: AVATAR_SIZE,
                        height: AVATAR_SIZE,
                        zIndex: 3,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Image
                            source={require('@/assets/images/Group1.png')}
                            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: 0 }}
                            resizeMode="contain"
                        />
                    </View>
                    {isMobile && (
                        <>
                            <GlowButton
                                style={{ position: 'absolute', top: -40, left: 8, zIndex: 2 }}
                                onPress={() => onNavigate('leftSidebar')}
                                iconOnly
                            >
                                <Image source={require('@/assets/images/Research.png')} style={{ width: 32, height: 32 }} />
                            </GlowButton>
                            <GlowButton
                                style={{ position: 'absolute', top: -40, right: 8, zIndex: 2 }}
                                onPress={() => onNavigate('taskTracker')}
                                iconOnly
                            >
                                <Image source={require('@/assets/images/Task Track.png')} style={{ width: 32, height: 32 }} />
                            </GlowButton>
                        </>
                    )}
                    <Image
                        source={require('@/assets/images/Group2.png')}
                        style={{ width: '100%', height: '100%', borderRadius: 0 }}
                        resizeMode="stretch"
                    />
                    <TextDisplay text={generatedText} isMobile={isMobile} conversation={conversation} scrollViewRef={scrollViewRef} />
                </View>
            </View>
        </View>
    );
}

const domSendIconStyle = {
    width: 10,
    height: 8,
    borderLeft: '5px solid #00EAFF',
    borderBottom: '5px solid #00EAFF',
    transform: 'rotate(230deg)',
    marginRight: 2,
    display: 'inline-block',
};

export default function CeoAiDashboard() {
    const [inputValue, setInputValue] = useState('');
    const [currentScreen, setCurrentScreen] = useState<null | 'leftSidebar' | 'aiReply' | 'taskTracker'>(null);
    const [showDrawer, setShowDrawer] = useState(true);
    const { isMobile } = useWindowQuery(1024);
    const { width } = useWindowDimensions();
    const { activeUser } = useAuthManager();
    const userPublicId = activeUser?.publicId;
    const queryClient = useQueryClient();
    const scrollViewRef = useRef<ScrollView>(null);

    const { coursePublicId } = useGlobalSearchParams<{ coursePublicId?: string }>();
    const courseIdForAi = coursePublicId || '';
    console.log("this is courseIdForAi ==> ", courseIdForAi);

    useEffect(() => {
        if (!courseIdForAi) {
            router.replace('/course-list');
        }
    }, [courseIdForAi]);

    const [generatedText, setGeneratedText] = useState('Click a content generator button to start...');
    const [isLoading, setIsLoading] = useState(false);
    const [isObjectionLoading, setIsObjectionLoading] = useState(false);
    const wizardQk = ['wizard', courseIdForAi];
    const [conversation, setConversation] = useState<Array<{ role: 'bot' | 'user'; content: string }>>([]);
    const wizardIsSuccess = useQuery({
        queryKey: wizardQk,
        queryFn: () => API.getAiConfig(courseIdForAi),
    });
    const wizardData = wizardIsSuccess.data;
    const [contentContext, setContentContext] = useState<{
        wizardCode: string;
        promptTemplate: string;
        generatedText: string;
    } | null>(null);

    const otherQk = ['wizard', courseIdForAi];
    const otherIsSuccess = useQuery({
        queryKey: otherQk,
        queryFn: () => API.getAiConfig(courseIdForAi),
    });
    const otherData = otherIsSuccess.data;

    const isInputDisabled = isLoading || isObjectionLoading;
    const isSendButtonDisabled = isInputDisabled || !inputValue.trim();

    const handleClear = () => {
        setGeneratedText('Click a content generator button to start...');
        setConversation([]);
        setContentContext(null);
    };

    const handleSend = async () => {
        if (!inputValue.trim() || !userPublicId) return;

        const userMessage = inputValue;
        setInputValue('');
        const updatedConversation = [...conversation, { role: 'user', content: userMessage }];
        setConversation(updatedConversation);
        setIsObjectionLoading(true);
        // Add loading indicator to conversation
        setConversation(prev => [...prev, { role: 'bot', content: 'Loading...' }]);
        scrollViewRef.current?.scrollToEnd({ animated: true });

        if (generatedText === 'Click a content generator button to start...') {
            setGeneratedText('');
        }

        try {
            let result;
            if (contentContext) {
    // When contentContext exists, we are in "objection" or "chat" mode.
    // Call generateContent with type: 'objection' and pass the real conversation history.
                console.log('Sending to generateContent (objection mode):', { objection: userMessage, prevMessages: updatedConversation });
                result = await generateContent(
                    userPublicId,
                    'objection', // <-- FIX 1: Explicitly set the type to 'objection'
                    userMessage,
                    updatedConversation, // <-- FIX 2: Pass the simple, ongoing conversation history
                    contentContext,
                    courseIdForAi
                );
            } else {
                // This block handles cases where the user starts chatting without generating content first. It is correct.
                console.log('Sending to generateObjectionOnly:', { objection: userMessage, prevMessages: updatedConversation });
                result = await generateObjectionOnly(
                    userPublicId,
                    userMessage,
                    courseIdForAi,
                    updatedConversation
                );
            }
            // Replace loading indicator with actual response
            setConversation(prev => {
                const newConversation = prev.filter(msg => msg.content !== 'Loading...');
                return [...newConversation, { role: 'bot', content: result.generatedText }];
            });
        } catch (error) {
            console.error('Error handling objection:', error);
            // Replace loading indicator with error message
            setConversation(prev => {
                const newConversation = prev.filter(msg => msg.content !== 'Loading...');
                return [...newConversation, { role: 'bot', content: 'Error processing objection. Please try again.' }];
            });
        } finally {
            setIsObjectionLoading(false);
        }
    };

    const handleKeyPress = (event: any) => {
        if (event.key === 'Enter' && !isSendButtonDisabled) {
            handleSend();
        }
    };

    const handleNavigate: (screen: 'leftSidebar' | 'aiReply' | 'taskTracker') => void = (screen) => {
        setCurrentScreen(screen);
        setShowDrawer(false);
    };

    const storeTask = async (description: string, type: 'Wizard' | 'Content') => {
        if (!userPublicId) {
            Alert.alert('Error', 'User not authenticated. Please log in.');
            return;
        }
        try {
            const response = await fetch(`${API.AI_BASE_URL}/trackers`, {
                method: 'POST',
                headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentPublicId: userPublicId,
                    trackingDescription: description,
                    type: type,
                    status: 'Success',
                }),
            });
            if (!response.ok) throw new Error('Failed to store task');
            queryClient.invalidateQueries({ queryKey: ['trackers', userPublicId] });
        } catch (error) {
            console.error('Error storing task:', error);
            Alert.alert('Error', 'Failed to store task. Please try again.');
        }
    };

    const handleContentGenerate = async (button: { buttonName: string; promptTemplate: string; wizardCode: string }) => {
        if (!userPublicId) {
            Alert.alert('Error', 'User not authenticated. Please log in.');
            return;
        }
        setIsLoading(true);
        setGeneratedText('Loading...'); // This will trigger the typing indicator
        setConversation([]);
        try {
            const result = await generateContent(userPublicId, button.wizardCode, button.promptTemplate, null, null, courseIdForAi);
            setGeneratedText(result.generatedText);
            setContentContext({
                wizardCode: button.wizardCode,
                promptTemplate: button.promptTemplate,
                generatedText: result.generatedText,
            });
            await storeTask(`${button.buttonName} completed`, 'Content');
            if (isMobile) {
                setCurrentScreen('aiReply');
            }
        } catch (error) {
            console.error('Content generation error:', error);
            setGeneratedText('Error generating content. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleWizardComplete = async (wizardCode: string) => {
        await storeTask(`${wizardCode} wizard completed`, 'Wizard');
    };

    if (!wizardIsSuccess.isSuccess) return <FullPageLoader />;
    if (isMobile) {
        return (
            <View style={styles.mobileContainer}>
                <View style={styles.mobileHeaderAbsolute}>
                    <View style={styles.headerIconRow}>
                        <GlowButton
                            onPress={() => setShowDrawer((prev) => !prev)}
                            style={styles.menuButton}
                            iconOnly
                        >
                            <CustomIcon name="apps" size={30} color="#FFFFFF" />
                        </GlowButton>
                        <GlowButton
                            onPress={() => router.back()}
                            style={styles.menuButton}
                            iconOnly
                        >
                            <CustomIcon name="home-02" size={30} color="#FFFFFF" />
                        </GlowButton>
                    </View>
                </View>
                <View style={styles.mobileContent}>
                    {showDrawer && (
                        <View style={[styles.mobileDrawerFullWidth, { pointerEvents: 'auto' }]}>
                            <MobileDrawer onNavigate={handleNavigate} />
                        </View>
                    )}
                    <View style={[styles.mobileMainContent, { pointerEvents: showDrawer ? 'none' : 'auto' }]}>
                        {currentScreen === 'leftSidebar' && (
                            <LeftSidebar
                                buttons={wizardData?.contentGenerators}
                                courseId={courseIdForAi}
                                onContentGenerate={handleContentGenerate}
                                onWizardComplete={handleWizardComplete}
                                setCurrentScreen={setCurrentScreen}
                            />
                        )}
                        {currentScreen === 'aiReply' && (
                            <>
                                <MiddleArea
                                    onNavigate={handleNavigate}
                                    courseId={courseIdForAi}
                                    generatedText={generatedText}
                                    conversation={conversation}
                                    scrollViewRef={scrollViewRef}
                                />
                                <div
                                    style={{
                                        borderRadius: 18,
                                        padding: 1,
                                        background: 'linear-gradient(180deg, rgba(255,255,255,0.5) -26.7%, rgba(255,255,255,0.05) 16.66%, rgba(255,255,255,0) 115.91%)',
                                        marginLeft: 12,
                                        marginRight: 12,
                                        marginBottom: 10,
                                        width: 'auto',
                                        boxSizing: 'border-box',
                                        overflow: 'visible',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <div
                                        style={{
                                            borderRadius: 18,
                                            background: 'linear-gradient(180deg, #17191b 0%, #15171A 75%)',
                                            width: '100%',
                                            height: '100%',
                                            paddingRight: 10,
                                            display: 'flex',
                                            alignItems: 'center',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <input
                                            style={{
                                                color: '#FFFFFF',
                                                fontSize: 14,
                                                fontWeight: 400,
                                                fontFamily: 'InterDisplay-Regular',
                                                borderWidth: 0,
                                                outline: 'none',
                                                background: 'transparent',
                                                flex: 1,
                                                borderRadius: 18,
                                                height: 48,
                                                minHeight: 48,
                                                paddingLeft: 16,
                                                paddingRight: 8,
                                                boxSizing: 'border-box',
                                                opacity: isInputDisabled ? 0.5 : 1,
                                                cursor: isInputDisabled ? 'not-allowed' : 'text',
                                            }}
                                            placeholder="What’s your client saying?"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            disabled={isInputDisabled}
                                        />
                                        <GlowButton
                                            onPress={handleClear}
                                            disabled={isInputDisabled}
                                        >
                                            <button
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    background: '#ffffff',
                                                    border: 'none',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: isInputDisabled ? 'not-allowed' : 'pointer',
                                                    padding: 0,
                                                    marginRight: 8,
                                                }}
                                            >
                                                <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>New</Text>
                                            </button>
                                        </GlowButton>
                                        <GlowButton
                                            onPress={handleSend}
                                            disabled={isSendButtonDisabled}
                                        >
                                            <button
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '50%',
                                                    background: '#ffffff',
                                                    border: 'none',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: isSendButtonDisabled ? 'not-allowed' : 'pointer',
                                                    padding: 0,
                                                }}
                                            >
                                                <ObjectionBIcon width={20} height={20} />
                                            </button>
                                        </GlowButton>
                                    </div>
                                </div>
                            </>
                        )}
                        {currentScreen === 'taskTracker' && <RightSidebar />}
                    </View>
                </View>
            </View>
        );
    }

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(90deg, #121416 0%, #131517 100%)',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
            overflow: 'hidden',
        }}>
            <View style={styles.pageContainer}>
                <View style={styles.leftCol}>
                    <LeftSidebar
                        buttons={wizardData?.contentGenerators}
                        courseId={courseIdForAi}
                        onContentGenerate={handleContentGenerate}
                        onWizardComplete={handleWizardComplete}
                    />
                </View>
                <View style={styles.middleCol}>
                    <MiddleArea
                        onNavigate={handleNavigate}
                        courseId={courseIdForAi}
                        generatedText={generatedText}
                        conversation={conversation}
                        scrollViewRef={scrollViewRef}
                    />
                    <div
                        style={{
                            borderRadius: 18,
                            padding: 1,
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.5) -26.7%, rgba(255,255,255,0.05) 16.66%, rgba(255,255,255,0) 115.91%)',
                            margin: moderateScale(15),
                            marginTop: moderateScale(8),
                            width: '95%',
                            height: verticalScale(25),
                            boxSizing: 'border-box',
                            overflow: 'visible',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <div
                            style={{
                                borderRadius: 18,
                                background: 'linear-gradient(180deg, #17191b 0%, #15171A 75%)',
                                width: '100%',
                                height: '100%',
                                paddingRight: 10,
                                display: 'flex',
                                alignItems: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            <View style={[styles.inputContainer, { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 18, overflow: 'hidden', paddingRight: 0 }]}>
                                <TextInput
                                    style={[styles.textInput, {
                                        outline: 'none',
                                        backgroundColor: 'transparent',
                                        flex: 1,
                                        opacity: isInputDisabled ? 0.5 : 1,
                                    }]}
                                    placeholder="What’s your client saying?"
                                    placeholderTextColor="#585757ff"
                                    value={inputValue}
                                    onChangeText={setInputValue}
                                    onSubmitEditing={() => !isSendButtonDisabled && handleSend()}
                                    multiline={false}
                                    underlineColorAndroid="transparent"
                                    editable={!isInputDisabled}
                                />
                                <GlowButton
                                    onPress={handleClear}
                                    disabled={isInputDisabled}
                                >
                                    <button
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: '#ffffff',
                                            border: 'none',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: isInputDisabled ? 'not-allowed' : 'pointer',
                                            marginLeft: 8,
                                            padding: 0,
                                        }}
                                    >
                                        <Text style={{ color: '#000', fontSize: 12, fontWeight: '600' }}>New</Text>
                                    </button>
                                </GlowButton>
                                <GlowButton
                                    onPress={handleSend}
                                    disabled={isSendButtonDisabled}
                                >
                                    <button
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            background: '#fff',
                                            border: 'none',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: isSendButtonDisabled ? 'not-allowed' : 'pointer',
                                            marginLeft: 8,
                                            padding: 0,
                                        }}
                                    >
                                        <ObjectionBIcon width={20} height={20} />
                                    </button>
                                </GlowButton>
                            </View>
                        </div>
                    </div>
                </View>
                <View style={styles.rightCol}>
                    <RightSidebar />
                </View>
            </View>
        </div>
    );
}

const styles = StyleSheet.create({
    pageContainer: {
        flex: 1,
        flexDirection: 'row',
        width: '100%',
        height: '100%',
        padding: moderateScale(0),
        marginRight: moderateScale(-5),
    },
    leftCol: {
        flex: 1,
        maxWidth: '19.5%',
        minWidth: '19.5%',
        height: '100%',
    },
    middleCol: {
        flex: 2,
        maxWidth: '65%',
        minWidth: '65%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    rightCol: {
        flex: 1,
        maxWidth: '15.5%',
        minWidth: '15.5%',
        height: '100%',
        marginRight: moderateScale(12),
    },
    middleArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        width: '100%',
        left: '0.5%',
        marginTop: -verticalScale(50),
    },
    overlapContainer: {
        width: '100%',
        height: verticalScale(100),
        justifyContent: 'flex-start',
        position: 'relative',
    },
    avatarSvgArea: {
        borderRadius: '0px',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        left: '50%',
        zIndex: 2,
        padding: 0,
        backgroundColor: 'transparent',
    },
    chatSvgArea: {
        width: '95%',
        height: verticalScale(165),
        alignSelf: 'center',
        justifyContent: 'flex-start',
        position: 'relative',
        padding: 0,
        margin: 0,
        borderRadius: 0,
        overflow: 'visible',
        top: 75,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: verticalScale(20),
        borderRadius: moderateScale(18),
        paddingHorizontal: moderateScale(10),
    },
    textInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: moderateScale(10),
        fontWeight: '400',
        fontFamily: 'InterDisplay-Regular',
        letterSpacing: 1,
        borderWidth: 0,
        padding: 0,
    },
    sendButton: {
        marginLeft: moderateScale(8),
        padding: moderateScale(8),
        backgroundColor: 'transparent',
        borderRadius: moderateScale(12),
    },
    sendIcon: {
        width: moderateScale(10),
        height: verticalScale(8),
        borderLeftWidth: 5,
        borderBottomWidth: 5,
        borderColor: '#00EAFF',
        transform: [{ rotate: '230deg' }],
        marginRight: moderateScale(2),
    },
    textDisplayContainer: {
        position: 'absolute',
        top: 90,
        left: '5%',
        right: '3%',
        bottom: '12%',
        padding: verticalScale(8),
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    displayText: {
        color: '#FFFFF1',
        fontSize: moderateScale(12),
        fontFamily: 'InterDisplay-Regular',
        lineHeight: moderateScale(20),
        fontWeight: '400',
        letterSpacing: 0.5,
        textAlign: 'left',
        backgroundColor: 'red',
    },
    mobileContainer: {
        flex: 1,
        backgroundColor: '#141414',
    },
    mobileHeaderAbsolute: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: moderateScale(76),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(8),
        backgroundColor: '#1C1C1C',
        borderBottomWidth: 1,
        borderBottomColor: '#2A2A2A',
        zIndex: 10000,
    },
    headerIconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
    },
    menuButton: {
        padding: moderateScale(8),
        marginLeft: 5,
    },
    mobileContent: {
        flex: 1,
        flexDirection: 'row',
    },
    mobileDrawerContainer: {
        width: moderateScale(250),
        backgroundColor: '#1C1C1C',
        borderRightWidth: 1,
        borderRightColor: '#2A2A2A',
    },
    mobileDrawerFullWidth: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: '#1C1C1C',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mobileMainContent: {
        flex: 1,
        width: '100%',
        backgroundColor: '#141414',
    },
    mobileInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: moderateScale(16),
        marginHorizontal: moderateScale(12),
        marginBottom: moderateScale(10),
        borderRadius: moderateScale(18),
        backgroundColor: '#1C1C1C',
        borderTopWidth: 1,
        borderTopColor: '#2A2A2A',
    },
    mobileTextInput: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: moderateScale(14),
        borderRadius: moderateScale(18),
        paddingHorizontal: moderateScale(16),
        paddingVertical: moderateScale(8),
    },
    mobileSendButton: {
        marginLeft: moderateScale(8),
        padding: moderateScale(8),
    },
    mobileDrawer: {
        flex: 1,
        backgroundColor: '#1C1C1C',
        width: '100%',
        height: '100%',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingTop: moderateScale(18),
        paddingLeft: moderateScale(8),
    },
    mobileDrawerContent: {
        marginTop: moderateScale(76) + moderateScale(8),
        paddingBottom: moderateScale(8),
        width: '100%',
        alignItems: 'flex-start',
        paddingLeft: moderateScale(12),
        paddingRight: moderateScale(12),
        justifyContent: 'flex-start',
    },
    mobileDrawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#232323',
        borderRadius: moderateScale(12),
        marginBottom: moderateScale(20),
        width: '100%',
        height: moderateScale(80),
        justifyContent: 'flex-start',
        paddingLeft: moderateScale(14),
        paddingRight: moderateScale(10),
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    mobileDrawerItemText: {
        color: '#FFFFFF',
        fontSize: moderateScale(14),
        fontFamily: 'Inter-Medium',
        marginLeft: moderateScale(8),
    },
});