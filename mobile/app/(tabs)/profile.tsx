import { StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState, useEffect } from 'react';
import { Picker } from '@react-native-picker/picker';

interface Church {
  id: number;
  name: string;
  city?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [joinChurchModalOpen, setJoinChurchModalOpen] = useState(false);
  const [selectedChurchId, setSelectedChurchId] = useState<number | null>(null);
  const [churches, setChurches] = useState<Church[]>([]);
  const [fetchingChurches, setFetchingChurches] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    churchId: user?.primaryChurch?.id || null,
  });

  useEffect(() => {
    if (joinChurchModalOpen) {
      fetchChurches();
    }
  }, [joinChurchModalOpen]);

  const fetchChurches = async () => {
    setFetchingChurches(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/v1';
      const response = await fetch(`${apiUrl}/churches`);
      const data = await response.json();

      if (response.ok) {
        setChurches(data.churches || []);
      }
    } catch (error) {
      console.error('Failed to fetch churches:', error);
    } finally {
      setFetchingChurches(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/v1';

      // Update profile information including church
      const response = await fetch(`${apiUrl}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          churchId: formData.churchId || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      churchId: user?.primaryChurch?.id || null,
    });
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    fetchChurches();
  };

  const handleJoinChurch = async () => {
    if (!selectedChurchId) {
      Alert.alert('Error', 'Please select a church');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/v1';
      const response = await fetch(`${apiUrl}/auth/join-church`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ churchId: selectedChurchId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to join church');
      }

      Alert.alert('Success', 'Successfully joined church!', [
        {
          text: 'OK',
          onPress: () => {
            setJoinChurchModalOpen(false);
            setSelectedChurchId(null);
            // Optionally refresh the screen
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to join church');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth/signin');
          },
        },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <FontAwesome name="user-circle" size={80} color="#ccc" />
        <Text style={styles.notSignedInText}>You are not signed in</Text>
        <TouchableOpacity
          style={styles.signInButton}
          onPress={() => router.push('/auth/signin')}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Header */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <FontAwesome name="user-circle" size={80} color="#007AFF" />
          </View>
          <Text style={styles.userName}>
            {user.firstName && user.lastName
              ? `${user.firstName} ${user.lastName}`
              : user.email}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditClick}
            >
              <FontAwesome name="edit" size={16} color="#007AFF" />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Profile Form */}
        {isEditing ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Edit Profile</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                placeholder="Enter first name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                placeholder="Enter last name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="Enter email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Church</Text>
              {fetchingChurches ? (
                <View style={[styles.input, styles.loadingContainer]}>
                  <Text style={styles.loadingText}>Loading churches...</Text>
                </View>
              ) : (
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.churchId}
                    onValueChange={(itemValue) => setFormData({ ...formData, churchId: itemValue })}
                    style={styles.picker}
                  >
                    <Picker.Item label="-- Select a church --" value={null} />
                    {churches.map((church) => (
                      <Picker.Item
                        key={church.id}
                        label={`${church.name}${church.city ? ` - ${church.city}` : ''}`}
                        value={church.id}
                      />
                    ))}
                  </Picker>
                </View>
              )}
              <Text style={styles.helperText}>Change your primary church</Text>
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={loading}
              >
                <FontAwesome name="check" size={16} color="#fff" />
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                disabled={loading}
              >
                <FontAwesome name="times" size={16} color="#666" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Profile Information</Text>

            <View style={styles.infoRow}>
              <FontAwesome name="user" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : 'Not set'}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <FontAwesome name="envelope" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Church Membership */}
        <View style={styles.churchCard}>
          <Text style={styles.churchTitle}>Church Membership</Text>

          {user.primaryChurch ? (
            <View style={styles.churchInfo}>
              <View style={styles.churchIconContainer}>
                <FontAwesome name="home" size={24} color="#007AFF" />
              </View>
              <View style={styles.churchDetails}>
                <Text style={styles.churchName}>{user.primaryChurch.name}</Text>
                {user.primaryChurch.city && (
                  <Text style={styles.churchLocation}>
                    <FontAwesome name="map-marker" size={12} color="#666" /> {user.primaryChurch.city}
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.noChurchContainer}>
              <FontAwesome name="home" size={48} color="#ccc" />
              <Text style={styles.noChurchText}>You haven't joined a church yet</Text>
              <TouchableOpacity
                style={styles.joinChurchButton}
                onPress={() => setJoinChurchModalOpen(true)}
              >
                <FontAwesome name="plus" size={16} color="#fff" />
                <Text style={styles.joinChurchButtonText}>Join a Church</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Account Settings */}
        <View style={styles.settingsCard}>
          <Text style={styles.settingsTitle}>Account Settings</Text>

          <TouchableOpacity
            style={styles.settingsItem}
            onPress={handleLogout}
          >
            <FontAwesome name="sign-out" size={20} color="#FF3B30" />
            <Text style={styles.logoutText}>Sign Out</Text>
            <FontAwesome name="chevron-right" size={16} color="#999" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Join Church Modal */}
      <Modal
        visible={joinChurchModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setJoinChurchModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <FontAwesome name="home" size={24} color="#007AFF" />
                <Text style={styles.modalTitle}>Join a Church</Text>
              </View>
              <TouchableOpacity
                onPress={() => setJoinChurchModalOpen(false)}
                style={styles.modalCloseButton}
              >
                <FontAwesome name="times" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Select Church</Text>

              {fetchingChurches ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading churches...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={selectedChurchId}
                      onValueChange={(itemValue) => setSelectedChurchId(itemValue)}
                      style={styles.picker}
                    >
                      <Picker.Item label="-- Select a church --" value={null} />
                      {churches.map((church) => (
                        <Picker.Item
                          key={church.id}
                          label={`${church.name}${church.city ? ` - ${church.city}` : ''}`}
                          value={church.id}
                        />
                      ))}
                    </Picker>
                  </View>

                  <Text style={styles.modalHint}>
                    Choose the church you would like to join
                  </Text>

                  <TouchableOpacity
                    style={[styles.modalButton, loading && styles.modalButtonDisabled]}
                    onPress={handleJoinChurch}
                    disabled={loading}
                  >
                    <Text style={styles.modalButtonText}>
                      {loading ? 'Joining...' : 'Join Church'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 15,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 20,
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F0F8FF',
    borderRadius: 20,
  },
  editButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutText: {
    flex: 1,
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '500',
  },
  notSignedInText: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 30,
    opacity: 0.6,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  churchCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  churchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  churchInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  churchIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#F0F8FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  churchDetails: {
    flex: 1,
  },
  churchName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  churchLocation: {
    fontSize: 14,
    color: '#666',
  },
  noChurchContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noChurchText: {
    fontSize: 14,
    color: '#666',
    marginTop: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  joinChurchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  joinChurchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  modalHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  helperText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
});
