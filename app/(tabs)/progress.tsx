import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/components/ThemeProvider';
import { useLearningStore } from '@/store/learningStore';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';
import { Calendar, TrendingUp, Brain, Trophy, Clock, BookOpen } from 'lucide-react-native';

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { stats, sessions, fetchSessions, updateStats } = useLearningStore();
  const [weeklyData, setWeeklyData] = useState<{ day: string; minutes: number }[]>([]);

  useEffect(() => {
    fetchSessions();
    updateStats();
    
    // Generate weekly activity data
    generateWeeklyData();
  }, []);

  useEffect(() => {
    if (stats?.weeklyActivity) {
      generateWeeklyData();
    }
  }, [stats]);

  const generateWeeklyData = () => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    
    // Adjust to make Monday the first day (0)
    const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - (adjustedDayOfWeek + (6 - i)));
      
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const minutes = stats?.weeklyActivity?.[dateStr] || 0;
      
      weekData.push({
        day: days[i === 6 ? 0 : i + 1], // Adjust index to match days array
        minutes,
      });
    }
    
    setWeeklyData(weekData);
  };

  // Calculate stats
  const totalSessions = stats?.totalSessions || 0;
  const totalTimeSpent = stats?.totalTimeSpent || 0;
  const totalWordsLearned = stats?.totalWordsLearned || 0;
  const streakDays = stats?.streakDays || 0;
  const correctRate = stats?.totalQuestions 
    ? Math.round((stats.totalCorrectAnswers / stats.totalQuestions) * 100) 
    : 0;
  
  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} saat ${minutes} dk`;
    }
    return `${minutes} dakika`;
  };

  // Find max minutes for chart scaling
  const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 10);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.text }]}>İlerleme</Text>
        
        {/* Streak Card */}
        <Card style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Text style={[styles.streakTitle, { color: colors.text }]}>
              Günlük Seri
            </Text>
            <View style={[styles.streakBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.streakBadgeText}>
                {streakDays} gün
              </Text>
            </View>
          </View>
          
          <View style={styles.streakIconContainer}>
            <View style={[styles.streakIcon, { backgroundColor: colors.primary + '20' }]}>
              <TrendingUp size={40} color={colors.primary} />
            </View>
            <Text style={[styles.streakText, { color: colors.textSecondary }]}>
              {streakDays > 0 
                ? 'Harika! Öğrenmeye devam et.' 
                : 'Bugün çalışarak serini başlat!'}
            </Text>
          </View>
        </Card>
        
        {/* Weekly Activity Chart */}
        <Card style={styles.weeklyCard}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Haftalık Aktivite
            </Text>
            <Calendar size={20} color={colors.primary} />
          </View>
          
          <View style={styles.chartContainer}>
            {weeklyData.map((item, index) => (
              <View key={index} style={styles.chartColumn}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { 
                        height: `${(item.minutes / maxMinutes) * 100}%`,
                        backgroundColor: item.minutes > 0 ? colors.primary : colors.border,
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                  {item.day}
                </Text>
              </View>
            ))}
          </View>
        </Card>
        
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Brain size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {totalSessions}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Toplam Oturum
            </Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.secondary + '20' }]}>
              <Clock size={24} color={colors.secondary} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatTime(totalTimeSpent)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Toplam Süre
            </Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.accent + '20' }]}>
              <BookOpen size={24} color={colors.accent} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {totalWordsLearned}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Çalışılan Kelime
            </Text>
          </Card>
          
          <Card style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.warning + '20' }]}>
              <Trophy size={24} color={colors.warning} />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              %{correctRate}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Doğruluk Oranı
            </Text>
          </Card>
        </View>
        
        {/* Recent Sessions */}
        <Card style={styles.sessionsCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Son Oturumlar
          </Text>
          
          {sessions.slice(0, 5).map((session, index) => (
            <View 
              key={index} 
              style={[
                styles.sessionItem,
                index < sessions.slice(0, 5).length - 1 && 
                  { borderBottomWidth: 1, borderBottomColor: colors.border }
              ]}
            >
              <View style={styles.sessionHeader}>
                <Text style={[styles.sessionMode, { color: colors.primary }]}>
                  {session.mode === 'learn' ? 'Öğrenme' : 'Test'} Modu
                </Text>
                <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>
                  {session.startTime?.toDate?.().toLocaleDateString() || 'Tarih yok'}
                </Text>
              </View>
              
              <View style={styles.sessionStats}>
                <Text style={[styles.sessionStat, { color: colors.text }]}>
                  {session.correctAnswers} / {session.totalQuestions} doğru
                </Text>
                <Text style={[styles.sessionScore, { color: colors.text }]}>
                  %{session.score || 0}
                </Text>
              </View>
              
              <ProgressBar 
                progress={session.score ? session.score / 100 : 0}
                height={4}
                progressColor={getScoreColor(session.score || 0, colors)}
              />
            </View>
          ))}
          
          {sessions.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Henüz oturum kaydı bulunmuyor
            </Text>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper function to get color based on score
const getScoreColor = (score: number, colors: any) => {
  if (score < 50) return colors.error;
  if (score < 80) return colors.warning;
  return colors.success;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  streakCard: {
    marginBottom: 16,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  streakBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  streakBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  streakIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  streakText: {
    fontSize: 16,
    flex: 1,
  },
  weeklyCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    width: 20,
    height: 120,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    marginTop: 8,
    fontSize: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    padding: 16,
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  sessionsCard: {
    marginBottom: 16,
  },
  sessionItem: {
    paddingVertical: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionMode: {
    fontSize: 16,
    fontWeight: '500',
  },
  sessionDate: {
    fontSize: 14,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionStat: {
    fontSize: 14,
  },
  sessionScore: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
  },
});