'use dom';

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useWindowDimensions } from 'react-native';
import { useAuthManager } from '@/hooks/useAuthManager';
import { useQuery } from '@tanstack/react-query';
import CustomIcon from '@/components/custom_icon/CustomIcon';
import { router } from 'expo-router';
import { API } from '@/api/api';

interface Tracker {
  id: number;
  studentPublicId: string;
  trackingDescription: string;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function CreditButton() {
  const [visible, setVisible] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setVisible(false);
      }
    };

    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [visible]);


   /*
    
    
  return (
    <div
      onClick={() => setVisible(!visible)}
      style={{
        height: 30,
        borderRadius: 15,
        backgroundColor: '#1C1D1F',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 10,
        cursor: 'pointer',
      }}
    >
      <CustomIcon name="star" size={14} color="#ffffff" style={{ marginRight: 4 }} />
      <Text style={{
        color: '#ffffff',
        fontSize: moderateScale(12),
        fontFamily: 'Inter-Medium',
        fontWeight: '600',
        marginRight: 4,
      }}>
        4
      </Text>
      <Text style={{
        color: '#1E90FF',
        fontSize: moderateScale(11),
        fontFamily: 'Inter-Medium',
        fontWeight: '600',
      }}>
        credits
      </Text>
      {visible && (
        <div
          ref={modalRef}
          style={{
            position: 'absolute',
            top: 40,
            right: 0,
            width: 180,
            backgroundColor: '#1C1D1F',
            borderRadius: 12,
            padding: 12,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            border: '1px solid #FFFFFF1A',
            zIndex: 9999,
          }}
        >
          <Text style={{
            color: '#ffffff',
            fontSize: moderateScale(13),
            fontFamily: 'Inter-Medium',
            marginBottom: 8,
          }}>
            Credits: 4
          </Text>
          <br />
          <br />
          <Text style={{
            color: '#888',
            fontSize: moderateScale(11),
            fontFamily: 'InterDisplay-Regular',
            marginBottom: 12,
          }}>
            Need more? Purchase additional credits to unlock advanced features.
          </Text>
        <TouchableOpacity
              onPress={() => router.navigate('/dashboard/orders')}
              style={{
                marginTop: 12,
                backgroundColor: '#1E90FF',
                borderRadius: 8,
                paddingVertical: 6,
                paddingHorizontal: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: '#ffffff',
                fontSize: moderateScale(11),
                fontFamily: 'Inter-Medium',
                fontWeight: '600',
              }}>
                Upgrade
              </Text>
            </TouchableOpacity>
          
        </div>
      )}
    </div>
  );
  */
}

export default function RightSidebar() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { activeUser } = useAuthManager();
  const userPublicId = (activeUser as { publicId?: string })?.publicId;

  const { data: trackers = [], isLoading } = useQuery<Tracker[]>({
    queryKey: ['trackers', userPublicId],
    queryFn: async () => {
      if (!userPublicId) return [];
      const response = await fetch(`${API.AI_BASE_URL}/trackers?studentPublicId=${userPublicId}`, {
        method: 'GET',
        headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch trackers');
      const data = await response.json();
      return data.sort((a: Tracker, b: Tracker) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    enabled: !!userPublicId,
  });

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Computed styles for font size
  const taskItemStyle = {
    ...styles.taskItem,
    fontSize: isMobile ? moderateScale(13) : moderateScale(9),
  };
  const taskDateStyle = {
    ...styles.taskDate,
    fontSize: isMobile ? moderateScale(10) : moderateScale(7),
  };
  const taskTrackerTitleStyle = {
    ...styles.taskTrackerTitle,
    fontSize: isMobile ? moderateScale(17) : moderateScale(11),
  };

  const sidebarContent = (
    <div style={{
      padding: 1,
      borderRadius: 20,
      background: 'linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 98%)',
      width: '95%',
      height: '100%',
      marginRight: isMobile ? 10 : 0,
      marginTop: isMobile ? 85 : 12,
      marginBottom: 12,
      marginLeft: isMobile ? 10 : 0,
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative', // added to fix stacking issue
      zIndex: 0,
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #1f2123 0%, #151617 75%)',
        borderRadius: 18,
        width: '100%',
        height: '100%',
        padding: 12,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative', // add this to fix modal overlapping issues
        zIndex: 0,
      }}>
        {/* Static Heading with Credit Button */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: moderateScale(10), zIndex: 1 }}>
          <Text style={taskTrackerTitleStyle}>Task Tracker</Text>
          <CreditButton />
        </View>

        {/* Scrollable Task List */}
        <div className="hide-scrollbar" style={{
          overflowY: 'auto',
          flex: 1,
          zIndex: 0,
        }}>
          <View style={styles.taskList}>
            {isLoading ? (
              <Text style={styles.loadingText}>Loading tasks...</Text>
            ) : trackers.length === 0 ? (
              <Text style={styles.emptyText}>No tasks completed yet</Text>
            ) : (
              trackers.map((tracker) => (
                <View key={tracker.id} style={styles.taskItemContainer}>
                  <Text style={taskItemStyle}>{tracker.trackingDescription}</Text>
                  <Text style={taskDateStyle}>{formatDateTime(tracker.createdAt)}</Text>
                </View>
              ))
            )}
          </View>
        </div>
      </div>
    </div>
  );

  return isMobile ? (
    <div style={{ padding: 10, height: '100dvh', boxSizing: 'border-box', background: '#111' }}>
      <div style={{ height: '100%' }}>
        {sidebarContent}
      </div>
    </div>
  ) : (
    sidebarContent
  );
}

const styles = StyleSheet.create({
  taskTrackerTitle: {
    color: '#FFFFFF',
    
    fontFamily: 'InterDisplay-SemiBold',
    fontWeight: '500',
    marginLeft: moderateScale(6),
    marginTop: moderateScale(10),
    letterSpacing: 0.5,
  },
  taskList: {
    marginTop: moderateScale(0),
  },
  taskItemContainer: {
    marginBottom: moderateScale(12.5),
    padding: moderateScale(8),
    backgroundColor: 'rgba(31, 40, 43, 0.95)',
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  taskItem: {
    color: '#FFFFF1',
    fontSize: moderateScale(9),
    fontFamily: 'InterDisplay-Regular',
    marginLeft: moderateScale(6),
    letterSpacing: 0.5,
  },
  taskDate: {
    color: '#B0B0B0',
    fontSize: moderateScale(7),
    fontFamily: 'InterDisplay-Regular',
    marginLeft: moderateScale(6),
    marginTop: moderateScale(4),
    letterSpacing: 0.5,
  },
  loadingText: {
    color: '#888',
    fontSize: moderateScale(11),
    fontFamily: 'InterDisplay-Regular',
    marginLeft: moderateScale(6),
    marginTop: moderateScale(10),
    letterSpacing: 0.5,
  },
  emptyText: {
    color: '#888',
    fontSize: moderateScale(11),
    fontFamily: 'InterDisplay-Regular',
    marginLeft: moderateScale(6),
    marginTop: moderateScale(10),
    letterSpacing: 0.5,
  },
});

// Hide scrollbar globally
if (typeof window !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `;
  document.head.appendChild(style);
}
