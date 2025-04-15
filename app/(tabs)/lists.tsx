import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useWordListStore } from '@/store/wordListStore';
import ListCard from '@/components/ListCard';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import { Plus, BookOpen, Search, SortAsc, SortDesc } from 'lucide-react-native';

export default function ListsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { lists, fetchLists, isLoading } = useWordListStore();
  const [refreshing, setRefreshing] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchLists();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLists();
    setRefreshing(false);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Sort lists based on updated date
  const sortedLists = [...lists].sort((a, b) => {
    const dateA = a.updatedAt?.toDate?.() || new Date(a.updatedAt || 0);
    const dateB = b.updatedAt?.toDate?.() || new Date(b.updatedAt || 0);
    
    return sortOrder === 'asc' 
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Kelime Listelerim</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.sortButton, { backgroundColor: colors.card }]}
            onPress={toggleSortOrder}
          >
            {sortOrder === 'asc' ? (
              <SortAsc size={20} color={colors.primary} />
            ) : (
              <SortDesc size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.searchButton, { backgroundColor: colors.card }]}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Search size={20} color={colors.primary} />
          </TouchableOpacity>
          <Button
            title="Yeni Liste"
            leftIcon={<Plus size={18} color="#FFFFFF" />}
            onPress={() => router.push('/list/create')}
            size="small"
          />
        </View>
      </View>

      {lists.length === 0 ? (
        <EmptyState
          title="Henüz liste oluşturmadınız"
          description="Yeni bir kelime listesi oluşturarak öğrenmeye başlayın"
          buttonTitle="Liste Oluştur"
          onButtonPress={() => router.push('/list/create')}
          icon={<BookOpen size={40} color={colors.primary} />}
        />
      ) : (
        <FlatList
          data={sortedLists}
          keyExtractor={(item) => item.id || ''}
          renderItem={({ item }) => (
            <ListCard
              list={item}
              onPress={() => router.push(`/list/${item.id}`)}
              showProgress
            />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
});