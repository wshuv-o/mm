import React, {  } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { useCourseStats } from '@/hooks/useCourseStats';
import { useWindowQuery } from '@/hooks/useWindowQuery';
import { format } from 'date-fns';
import { API } from '@/api/api';

const EnrolledProfileScreen = () => {
  const { dataWithLessonStats } = useCourseStats();

   const {isMobile} = useWindowQuery(768);

  return (
    <View style={styles.container}>
      <View style={styles.secondContainer}>
        <View style={styles.inProgressSection}>
          <View style={styles.rowDash}>
            <Text style={styles.sectionTitle}>Enrolled Course</Text>
          </View>

          {dataWithLessonStats.length ? (
            dataWithLessonStats.map((course, index) => (
              <View key={index} style={styles.courseCard}>
                <Image source={{ uri: API.url(course.coverImage.url) }} style={styles.courseImage} />
                <View style={styles.courseDetails}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  {isMobile ? (
                    <>
                      <Text style={styles.courseDate}>Start: {format(course.createdAt, "yyyy-MM-dd")}</Text>
                      <View style={styles.progressWrapper}>
                        <View style={styles.progressContainer}>
                          <View
                            style={[
                              styles.progressBar,
                              { width: `${course.lessionStats.progressPct}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {course.lessionStats.progressStr}
                        </Text>
                      </View>
                    </>
                  ) : (
                    
                    
                    <View style={styles.desktopRow}>
                      <Text style={[styles.courseDate, styles.desktopDate]}>
                        Start: {format(course.createdAt, "yyyy-MM-dd")}
                      </Text>
                      <View style={[styles.progressWrapper, styles.desktopProgressWrapper]}>
                        <View style={styles.progressContainer}>
                          <View
                            style={[
                              styles.progressBar,
                              { width: `${course.lessionStats.progressPct}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.progressText}>
                          {course.lessionStats.progressStr}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noCoursesText}>No in-progress courses available</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  secondContainer: {
    padding: moderateScale(8),
  },
  inProgressSection: {
    marginTop: moderateScale(6),
    marginBottom: moderateScale(5),
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderRadius: moderateScale(10),
    borderColor: '#282828',
  },
  rowDash: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center',
    padding: moderateScale(8),
    paddingLeft: moderateScale(12),
  },
  sectionTitle: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    // fontFamily: 'poppins',
    color: '#FAFAFB',
    textAlign: 'center',
  },
  iconB: {
    marginRight: moderateScale(6),
  },
  dropdownContainer: {
    padding: moderateScale(8),
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  dropdown: {
    height: moderateScale(30),
    borderColor: '#282828',
    backgroundColor: '#252525',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  dropdownPlaceholder: {
    fontSize: moderateScale(10),
    fontWeight: '400',
    fontFamily: 'poppins',
    color: '#D5D5DC',
  },
  dropdownText: {
    color: '#D5D5DC',
    fontSize: 12,
  },
  dropdownItem: {
    padding: moderateScale(8),
    borderBottomWidth: 1,
    borderColor: '#282828',
    backgroundColor: '#252525',
  },
  dropdownItemText: {
    fontSize: moderateScale(10),
    fontWeight: '500',
    fontFamily: 'poppins',
    color: '#FAFAFB',
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(8),
    backgroundColor: '#1A1A1A',
    // borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
    // paddingBottom:'auto',
    borderBottomWidth:1,
    borderColor:'#282828',
    // borderWidth:1,
    
  },
  courseImage: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(4),
    marginRight: moderateScale(12),
  },
  courseDetails: {
    flex: 1,
  },
  courseTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    // fontFamily: 'poppins',
    color: '#FAFAFB',
    
  },
  courseDate: {
    fontSize: moderateScale(12),
    color: "#808080",
    marginVertical: moderateScale(4),
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressContainer: {
    flex: 1,
    height: 5,
    backgroundColor: '#333',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#E53935',
  },
  progressText: {
    fontSize: moderateScale(10),
    fontWeight: '400',
    fontFamily: 'poppins',
    color: '#FFFFFF',
    textAlign: 'right',
  },
  noCoursesText: {
    fontSize: moderateScale(14),
    fontWeight: '400',
    fontFamily: 'poppins',
    color: '#D5D5DC',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: moderateScale(8),
    gap: 10,
  },
  tab: {
    paddingHorizontal: moderateScale(20),
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#E53935',
    fontWeight: "700",
  },
  tabText: {
    fontSize: moderateScale(10),
    color: '#D5D5DC',
  },


  desktopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  desktopDate: {
    flex: 0.3,
  },
  desktopProgressWrapper: {
    // backgroundColor:'red',
    flex: 0.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom:30,
  },
});

export default EnrolledProfileScreen;
