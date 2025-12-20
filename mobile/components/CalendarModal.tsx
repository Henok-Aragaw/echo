import React, { useState } from 'react';
import { 
  View, Text, Modal, TouchableOpacity, TouchableWithoutFeedback 
} from 'react-native';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameDay, subMonths, addMonths, isToday 
} from 'date-fns';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import clsx from 'clsx';

interface CalendarModalProps {
  visible: boolean;
  selectedDate: Date | null;
  onClose: () => void;
  onSelectDate: (date: Date | null) => void;
}

export const CalendarModal = ({ 
  visible, 
  onClose, 
  onSelectDate, 
  selectedDate 
}: CalendarModalProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handleSelect = (date: Date | null) => {
    onSelectDate(date);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/40 dark:bg-black/70 justify-center items-center px-6">
            <TouchableWithoutFeedback>
              <View className="bg-white dark:bg-[#151413] w-full rounded-[32px] p-6 shadow-2xl border border-stone-100 dark:border-stone-800">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-stone-900 dark:text-stone-100 text-xl font-bold">Time Travel</Text>
                        <Text className="text-stone-400 text-xs font-medium uppercase tracking-wider">Select a date</Text>
                    </View>
                    <TouchableOpacity onPress={onClose} className="p-2 bg-stone-100 dark:bg-stone-800 rounded-full">
                        <X size={18} color={isDark ? "#fff" : "#000"} />
                    </TouchableOpacity>
                </View>

                {/* Month Navigator */}
                <View className="flex-row justify-between items-center mb-6 bg-stone-50 dark:bg-stone-900 p-2 rounded-2xl">
                    <TouchableOpacity onPress={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2">
                        <ChevronLeft size={20} color={isDark ? "#d6d3d1" : "#57534e"} />
                    </TouchableOpacity>
                    <Text className="text-base font-bold text-stone-800 dark:text-stone-200">{format(currentMonth, 'MMMM yyyy')}</Text>
                    <TouchableOpacity onPress={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2">
                        <ChevronRight size={20} color={isDark ? "#d6d3d1" : "#57534e"} />
                    </TouchableOpacity>
                </View>

                {/* Grid */}
                <View className="flex-row flex-wrap justify-start">
                    {daysInMonth.map((day) => {
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isFuture = day > new Date();
                        
                        return (
                            <TouchableOpacity 
                                key={day.toString()} 
                                disabled={isFuture}
                                onPress={() => handleSelect(day)}
                                style={{ width: '14.28%' }}
                                className="items-center justify-center py-3"
                            >
                                <View className={clsx(
                                    "w-8 h-8 rounded-full items-center justify-center",
                                    isSelected ? "bg-stone-900 dark:bg-stone-100" : "bg-transparent",
                                    isToday(day) && !isSelected && "border border-stone-300 dark:border-stone-700"
                                )}>
                                    <Text className={clsx(
                                        "text-xs font-medium",
                                        isSelected ? "text-white dark:text-black" : isFuture ? "text-stone-200 dark:text-stone-800" : "text-stone-600 dark:text-stone-400"
                                    )}>
                                        {format(day, 'd')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Reset Button */}
                <View className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <TouchableOpacity onPress={() => handleSelect(null)} className="w-full py-4 bg-stone-100 dark:bg-stone-900 rounded-2xl items-center">
                        <Text className="text-stone-900 dark:text-stone-100 font-bold text-sm">Show All Memories</Text>
                    </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};