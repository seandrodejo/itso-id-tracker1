import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  RefreshControl,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigationWithTransition } from "../hooks/useNavigationTransition";
import { LinearGradient } from 'expo-linear-gradient';
import nuLogo from '../assets/images/nu-logo.png';
import { useAuth } from '../contexts/AuthContext';
import { announcementAPI, Announcement } from '../src/config/api';
import { AnimatedScreen } from '../components/AnimatedScreen';
import { BottomNavigation } from '../components/BottomNavigation';

export default function Announcements() {
  const { navigateToPage, currentRoute } = useNavigationWithTransition();
  const { user, isAuthenticated, loading } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Only redirect if we're not already on the login page
      if (currentRoute !== '/login') {
        navigateToPage('/login');
      }
    }
  }, [isAuthenticated, loading, currentRoute, navigateToPage]);

  // Fetch announcements when component mounts
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setAnnouncementsLoading(true);
        const response = await announcementAPI.getAnnouncements();
        setAnnouncements(response.items);
      } catch (error) {
        Alert.alert('Error', 'Failed to load announcements. Please try again.');
      } finally {
        setAnnouncementsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchAnnouncements();
    }
  }, [isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await announcementAPI.getAnnouncements();
      setAnnouncements(response.items);
    } catch (error) {
      Alert.alert('Error', 'Failed to load announcements. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  // Navigation function is now provided by the hook

  const openAnnouncementPopup = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsPopupVisible(true);
  };

  const closeAnnouncementPopup = () => {
    setIsPopupVisible(false);
    setSelectedAnnouncement(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <AnimatedScreen route="/announcements" currentRoute={currentRoute}>
        {/* Top Bar */}
        <LinearGradient
          colors={['#1e40af', '#3b82f6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBar}
        >
          <View style={styles.logoContainer}>
            <Image source={nuLogo} style={styles.logoImage} resizeMode="contain" />
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTitle}>NU Dasmarinas</Text>
              <Text style={styles.logoSubtitle}>ITSO ID Tracker</Text>
            </View>
          </View>
          <Text style={styles.greeting}>Hi, {user?.name || 'User'}!</Text>
        </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1e40af']}
            tintColor="#1e40af"
          />
        }
      >
        {/* Announcements Section */}
        <Text style={styles.sectionTitle}>Announcements</Text>
        
        {/* Loading State */}
        {announcementsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1e40af" />
            <Text style={styles.loadingText}>Loading announcements...</Text>
          </View>
        ) : announcements.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>No announcements available</Text>
          </View>
        ) : (
          /* Announcement Cards */
          announcements.map((announcement) => (
            <TouchableOpacity 
              key={announcement._id} 
              style={styles.announcementCard}
              onPress={() => openAnnouncementPopup(announcement)}
              activeOpacity={0.7}
            >
              <View style={styles.announcementHeader}>
                <Ionicons name="megaphone-outline" size={24} color="#1e40af" />
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <Text style={styles.announcementDate}>
                  {new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
              <Text style={styles.announcementContent} numberOfLines={3}>
                {announcement.content}
              </Text>
              {announcement.tags && announcement.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {announcement.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
        </ScrollView>

        {/* Announcement Popup Modal */}
        <Modal
        visible={isPopupVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeAnnouncementPopup}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop layer to close on outside tap */}
          <Pressable style={StyleSheet.absoluteFill} onPress={closeAnnouncementPopup} />

          {/* Content container (not pressable) so scrolling works */}
          <View style={styles.modalContainer}>
            {selectedAnnouncement && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.popupAnnouncementHeader}>
                    <Ionicons name="megaphone-outline" size={24} color="#1e40af" />
                    <Text style={styles.modalTitle}>{selectedAnnouncement.title}</Text>
                  </View>
                  <TouchableOpacity onPress={closeAnnouncementPopup} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color="#64748b" />
                  </TouchableOpacity>
                </View>
                
                <ScrollView 
                  style={styles.modalContent}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  scrollEventThrottle={16}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
                >
                
                <Text style={styles.popupAnnouncementDate}>
                  {new Date(selectedAnnouncement.publishedAt || selectedAnnouncement.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                
                <Text style={styles.popupAnnouncementContent}>
                  {selectedAnnouncement.content}
                </Text>
                
                {selectedAnnouncement.images && selectedAnnouncement.images.length > 0 && (
                  <View style={styles.imagesContainer}>
                    <Text style={styles.sectionLabel}>Images:</Text>
                    {selectedAnnouncement.images.map((image, index) => (
                      <Image key={index} source={{ uri: image }} style={styles.announcementImage} />
                    ))}
                  </View>
                )}
                
                {selectedAnnouncement.links && selectedAnnouncement.links.length > 0 && (
                  <View style={styles.linksContainer}>
                    <Text style={styles.sectionLabel}>Links:</Text>
                    {selectedAnnouncement.links.map((link, index) => (
                      <TouchableOpacity key={index} style={styles.linkButton}>
                        <Ionicons name="link-outline" size={16} color="#1e40af" />
                        <Text style={styles.linkText}>{link}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                
                {selectedAnnouncement.tags && selectedAnnouncement.tags.length > 0 && (
                  <View style={styles.popupTagsContainer}>
                    <Text style={styles.sectionLabel}>Tags:</Text>
                    <View style={styles.tagsRow}>
                      {selectedAnnouncement.tags.map((tag, index) => (
                        <View key={index} style={styles.popupTag}>
                          <Text style={styles.popupTagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>
              </>
            )}
          </View>
        </View>
        </Modal>
        </AnimatedScreen>
      </View>

      {/* Bottom Navigation - Always present and unaffected by animations */}
      <BottomNavigation currentRoute={currentRoute} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#eeeeeeff" },
  contentContainer: { flex: 1 },
  scrollContainer: { flex: 1, paddingHorizontal: 16 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    height: 80,
    paddingTop: 35,
  },
  logoImage: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  logoTextContainer: {
    flexDirection: "column",
  },
  logoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: 16,
  },
  logoSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: 14,
  },
  greeting: { fontSize: 14, fontWeight: "600", color: "#ffffff", paddingTop: 35 },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 10 },

  announcementCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  announcementHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  announcementTitle: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#1e40af", 
    flex: 1, 
    marginLeft: 8 
  },
  announcementDate: { 
    fontSize: 12, 
    color: "#64748b" 
  },
  announcementContent: { 
    fontSize: 12, 
    color: "#475569", 
    lineHeight: 18 
  },


  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748b",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: "#94a3b8",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    color: "#1e40af",
    fontWeight: "500",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: Dimensions.get('window').height * 0.8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 20,
    height: '73%',
    borderWidth: 2,
    borderColor: 'rgba(13, 17, 235, 0.62)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#fafbfc',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e40af',
    flex: 1,
    marginLeft: 12,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  // Popup announcement styles
  popupAnnouncementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  popupAnnouncementDate: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 20,
    fontStyle: 'italic',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  popupAnnouncementContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 26,
    marginBottom: 24,
    textAlign: 'justify',
  },

  // Section styles
  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 12,
    marginTop: 24,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#e0e7ff',
  },
  imagesContainer: {
    marginBottom: 20,
  },
  announcementImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: 'cover',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  linksContainer: {
    marginBottom: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  linkText: {
    fontSize: 15,
    color: '#1e40af',
    marginLeft: 12,
    flex: 1,
    fontWeight: '500',
  },
  popupTagsContainer: {
    marginBottom: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  popupTag: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  popupTagText: {
    fontSize: 13,
    color: '#1e40af',
    fontWeight: '600',
  },
});
