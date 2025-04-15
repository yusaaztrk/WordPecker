import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { Edit, Trash2, Volume2, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Word } from '@/firebase/wordLists';

interface WordCardProps {
  word: Word;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const WordCard: React.FC<WordCardProps> = ({
  word,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const handlePlayPronunciation = () => {
    // Implement pronunciation playback
    console.log('Play pronunciation for:', word.term);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        }
      ]}
    >
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpand}
        activeOpacity={0.7}
      >
        <View style={styles.termContainer}>
          <Text style={[styles.term, { color: colors.text }]}>
            {word.term}
          </Text>
          {word.pronunciation && (
            <TouchableOpacity
              style={styles.pronunciationButton}
              onPress={handlePlayPronunciation}
            >
              <Volume2 size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.rightContainer}>
          {showActions && (
            <View style={styles.actions}>
              {onEdit && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
                  onPress={onEdit}
                >
                  <Edit size={16} color={colors.primary} />
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
                  onPress={onDelete}
                >
                  <Trash2 size={16} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {expanded ? (
            <ChevronUp size={20} color={colors.textSecondary} />
          ) : (
            <ChevronDown size={20} color={colors.textSecondary} />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.definitionContainer}>
        <Text style={[styles.definition, { color: colors.text }]}>
          {word.definition}
        </Text>
      </View>

      {expanded && word.example && (
        <View style={[styles.exampleContainer, { backgroundColor: colors.primary + '10' }]}>
          <Text style={[styles.exampleLabel, { color: colors.primary }]}>
            Örnek:
          </Text>
          <Text style={[styles.example, { color: colors.text }]}>
            {word.example}
          </Text>
        </View>
      )}

      {expanded && word.notes && (
        <View style={styles.notesContainer}>
          <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>
            Notlar:
          </Text>
          <Text style={[styles.notes, { color: colors.textSecondary }]}>
            {word.notes}
          </Text>
        </View>
      )}

      {expanded && word.mastery !== undefined && (
        <View style={styles.masteryContainer}>
          <Text style={[styles.masteryLabel, { color: colors.textSecondary }]}>
            Hakimiyet:
          </Text>
          <View style={styles.masteryBarContainer}>
            <View
              style={[
                styles.masteryBar,
                {
                  width: `${word.mastery}%`,
                  backgroundColor: getMasteryColor(word.mastery, colors),
                }
              ]}
            />
          </View>
          <Text style={[styles.masteryValue, { color: colors.textSecondary }]}>
            %{word.mastery}
          </Text>
        </View>
      )}
    </View>
  );
};

// Helper function to get color based on mastery level
const getMasteryColor = (mastery: number, colors: any) => {
  if (mastery < 30) return colors.error;
  if (mastery < 70) return colors.warning;
  return colors.success;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  termContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  term: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pronunciationButton: {
    marginLeft: 8,
    padding: 4,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    marginRight: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  definitionContainer: {
    marginTop: 8,
  },
  definition: {
    fontSize: 16,
  },
  exampleContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  example: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  notesContainer: {
    marginTop: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notes: {
    fontSize: 14,
  },
  masteryContainer: {
    marginTop: 12,
  },
  masteryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  masteryBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  masteryBar: {
    height: '100%',
  },
  masteryValue: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});

export default WordCard;