import { StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery } from '@tanstack/react-query';
import { Church, ChurchesResponse } from '@ska/shared';
import { apiClient } from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ChurchSelectScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery<ChurchesResponse>({
    queryKey: ['churches', search],
    queryFn: () => apiClient.get<ChurchesResponse>(`/churches?search=${search}`),
  });

  const handleSelectChurch = async (church: Church) => {
    // TODO: Implement user authentication and church joining
    // For now, just navigate to church home
    router.push(`/church/${church.slug}`);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>Error loading churches</Text>
        <Text style={styles.errorDetail}>{String(error)}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Your Church</Text>
        <Text style={styles.subtitle}>
          Connect with your local Congregation
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <FontAwesome name="search" size={18} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by church name or city..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.content}>
        {data?.churches && data.churches.length > 0 ? (
          data.churches.map((church) => (
            <TouchableOpacity
              key={church.id}
              style={styles.churchCard}
              onPress={() => handleSelectChurch(church)}
            >
              <View style={styles.churchInfo}>
                {church.logoAsset ? (
                  <View style={styles.logoContainer}>
                    <FontAwesome name="church" size={24} color="#007AFF" />
                  </View>
                ) : (
                  <View style={styles.logoPlaceholder}>
                    <FontAwesome name="church" size={24} color="#007AFF" />
                  </View>
                )}
                <View style={styles.churchDetails}>
                  <Text style={styles.churchName}>{church.name}</Text>
                  <View style={styles.locationRow}>
                    <FontAwesome name="map-marker" size={14} color="#666" />
                    <Text style={styles.churchLocation}>
                      {church.city}, {church.country}
                    </Text>
                  </View>
                  <View style={styles.membersRow}>
                    <FontAwesome name="users" size={12} color="#666" />
                    <Text style={styles.memberCount}>
                      {church.memberCount} members
                    </Text>
                  </View>
                </View>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#999" />
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <FontAwesome name="search" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No churches found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search terms
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Can't find your church?
        </Text>
        <TouchableOpacity style={styles.requestButton}>
          <Text style={styles.requestButtonText}>Request to Add Church</Text>
        </TouchableOpacity>
      </View>
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
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.9,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
  },
  content: {
    padding: 15,
    paddingTop: 0,
  },
  churchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  churchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  churchDetails: {
    flex: 1,
  },
  churchName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  churchLocation: {
    fontSize: 14,
    color: '#666',
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  memberCount: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  requestButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  error: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
});
