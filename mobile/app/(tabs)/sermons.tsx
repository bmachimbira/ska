import { StyleSheet, FlatList, ActivityIndicator, RefreshControl, TextInput, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useQuery } from '@tanstack/react-query';
import { SermonsResponse } from '@ska/shared';
import { apiClient } from '@/lib/api';
import { SermonCard } from '@/components/SermonCard';
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function SermonsScreen() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const limit = 20;

  const debouncedSetSearch = useCallback(
    debounce((text: string) => {
      setDebouncedSearch(text);
      setPage(1);
    }, 500),
    []
  );

  const handleSearchChange = (text: string) => {
    setSearch(text);
    debouncedSetSearch(text);
  };

  const buildQueryString = () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (debouncedSearch) {
      params.append('search', debouncedSearch);
    }
    return params.toString();
  };

  const { data, isLoading, error, refetch, isRefetching } = useQuery<SermonsResponse>({
    queryKey: ['sermons', page, debouncedSearch],
    queryFn: () => apiClient.get<SermonsResponse>(`/sermons?${buildQueryString()}`),
  });

  if (isLoading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.error}>Error loading sermons</Text>
        <Text style={styles.errorDetail}>{String(error)}</Text>
      </View>
    );
  }

  const loadMore = () => {
    if (data?.pagination && page < data.pagination.pages) {
      setPage(page + 1);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <FontAwesome name="search" size={18} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sermons..."
            value={search}
            onChangeText={handleSearchChange}
            placeholderTextColor="#888"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange('')}>
              <FontAwesome name="times-circle" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={data?.sermons || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <SermonCard sermon={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {data?.pagination && (
              <Text style={styles.subtitle}>
                {data.pagination.total} sermons{debouncedSearch ? ` matching "${debouncedSearch}"` : ''} • Page {data.pagination.page} of {data.pagination.pages}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {search ? `No sermons found for "${search}"` : 'No sermons available'}
            </Text>
          </View>
        }
        ListFooterComponent={
          data?.pagination && page < data.pagination.pages ? (
            <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
              <Text style={styles.loadMoreText}>Load More</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
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
  searchContainer: {
    padding: 15,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  list: {
    padding: 15,
  },
  header: {
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.5,
    textAlign: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 15,
  },
  loadMoreText: {
    color: '#fff',
    fontSize: 16,
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
