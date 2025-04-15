import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useAuthStore } from '@/store/authStore';
import { useWordListStore } from '@/store/wordListStore';
import { useLearningStore } from '@/store/learningStore';
import Button from '@/components/Button';
import Card from '@/components/Card';
import StatsCard from '@/components/StatsCard';
import EmptyState from '@/components/EmptyState';
import ListCard from '@/components/ListCard';
import { Plus, BookOpen, Brain, Trophy, TrendingUp } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { lists, fetchLists, isLoading: listsLoading } = useWordListStore();
  const { stats, updateStats, isLoading: statsLoading } = useLearningStore();

  useEffect(() => {
    fetchLists();
    updateStats();
  }, []);

  const recentLists = lists.slice(0, 3);
  
  // Calculate stats
  const totalWords = lists.reduce((sum, list) => sum + (list.wordCount || 0), 0);
  const streakDays = stats?.streakDays || 0;
  const totalSessions = stats?.totalSessions || 0;
  const correctRate = stats?.totalQuestions 
    ? Math.round((stats.totalCorrectAnswers / stats.totalQuestions) * 100) 
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with greeting */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Merhaba,
            </Text>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.displayName || 'Kullanıcı'}
            </Text>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&auto=format&fit=crop' }}
            style={styles.logo}
          />
        </View>

        {/* Stats cards */}
        <View style={styles.statsContainer}>
          <StatsCard
            title="Kelime"
            value={totalWords.toString()}
            icon={<BookOpen size={20} color={colors.primary} />}
            color={colors.primary}
          />
          <StatsCard
            title="Seri"
            value={streakDays.toString()}
            icon={<TrendingUp size={20} color={colors.secondary} />}
            color={colors.secondary}
          />
          <StatsCard
            title="Oturum"
            value={totalSessions.toString()}
            icon={<Brain size={20} color={colors.accent} />}
            color={colors.accent}
          />
          <StatsCard
            title="Başarı"
            value={`%${correctRate}`}
            icon={<Trophy size={20} color={colors.warning} />}
            color={colors.warning}
          />
        </View>

        {/* Quick actions */}
        <Card style={styles.actionsCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Hızlı İşlemler
          </Text>
          <View style={styles.actionsContainer}>
            <Button
              title="Liste Oluştur"
              leftIcon={<Plus size={18} color="#FFFFFF" />}
              onPress={() => router.push('/list/create')}
              style={styles.actionButton}
            />
            <Button
              title="Listelerim"
              variant="outline"
              leftIcon={<BookOpen size={18} color={colors.primary} />}
              onPress={() => router.push('/(tabs)/lists')}
              style={styles.actionButton}
            />
          </View>
        </Card>

        {/* Recent lists */}
        <View style={styles.recentListsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Son Listeleriniz
          </Text>
          
          {recentLists.length > 0 ? (
            <View style={styles.recentLists}>
              {recentLists.map((list) => (
                <ListCard
                  key={list.id}
                  list={list}
                  onPress={() => router.push(`/list/${list.id}`)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              title="Henüz liste oluşturmadınız"
              description="Yeni bir kelime listesi oluşturarak öğrenmeye başlayın"
              buttonTitle="Liste Oluştur"
              onButtonPress={() => router.push('/list/create')}
              icon={<BookOpen size={40} color={colors.primary} />}
            />
          )}
          
          {recentLists.length > 0 && (
            <Button
              title="Tüm Listeleri Görüntüle"
              variant="ghost"
              onPress={() => router.push('/(tabs)/lists')}
              style={styles.viewAllButton}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  actionsCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  recentListsSection: {
    marginBottom: 24,
  },
  recentLists: {
    gap: 12,
  },
  viewAllButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
});