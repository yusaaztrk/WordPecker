import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { BookOpen, Clock } from 'lucide-react-native';
import { WordList } from '@/firebase/wordLists';
import ProgressBar from './ProgressBar';

interface ListCardProps {
  list: WordList;
  onPress: () => void;
  showProgress?: boolean;
}

const ListCard: React.FC<ListCardProps> = ({ 
  list, 
  onPress, 
  showProgress = false 
}) => {
  const { colors } = useTheme();
  
  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Tarih yok';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {list.name}
          </Text>
          <View style={styles.languageContainer}>
            <Text style={[styles.language, { color: colors.textSecondary }]}>
              {list.language} → {list.targetLanguage}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <BookOpen size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {list.wordCount || 0} kelime
          </Text>
        </View>
        
        <View style={styles.infoItem}>
          <Clock size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {formatDate(list.updatedAt)}
          </Text>
        </View>
      </View>
      
      {showProgress && (
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={0.3} // Replace with actual progress
            height={6}
          />
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            %30 tamamlandı
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  language: {
    fontSize: 14,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 14,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});

export default ListCard;