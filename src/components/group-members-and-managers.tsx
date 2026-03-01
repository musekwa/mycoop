import Tag from "@/components/custom-tag";
import GroupManagersList from "@/features/groups/group-managers-list";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomSafeAreaView from "./layouts/safe-area-view";

interface GroupMembersAndManagersProps {
  horizontalData: { title: string; iconName: string }[];
  verticalData: { id: number; title: string; component: ReactNode }[];
}

export default function GroupMembersAndManagers({
  horizontalData,
  verticalData,
}: GroupMembersAndManagersProps) {
  const horizontalScrollRef = useRef<any>(null);

  const verticalScrollRef = useRef<any>(null);
  const layoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const insets = useSafeAreaInsets();
  const screenWindow = Dimensions.get("window");
  const [selected, setSelected] = useState(0);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (layoutTimerRef.current) {
        clearTimeout(layoutTimerRef.current);
        layoutTimerRef.current = null;
      }
    };
  }, []);

  // Scroll to initial index after layout is ready
  useEffect(() => {
    if (isLayoutReady && selected > 0 && verticalScrollRef.current) {
      // Small delay to ensure FlatList has measured all items
      const timer = setTimeout(() => {
        // Use scrollToOffset for more reliable initial positioning
        const offset = selected * screenWindow.width;
        verticalScrollRef.current?.scrollToOffset({ offset, animated: false });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLayoutReady, selected, screenWindow.width]);

  const onItemPress = (index: number) => {
    setSelected(index);
    if (verticalScrollRef.current) {
      try {
        verticalScrollRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0,
        });
      } catch (error) {
        // Fallback to scrollToOffset if scrollToIndex fails
        const offset = index * screenWindow.width;
        verticalScrollRef.current?.scrollToOffset({ offset, animated: true });
      }
    }

    if (horizontalScrollRef.current) {
      try {
        horizontalScrollRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      } catch (error) {
        // Silently fail if component is unmounting
      }
    }
  };

  return (
    <CustomSafeAreaView edges={["bottom"]}>
      <View style={{ flexShrink: 0 }}>
        <FlatList
          ref={horizontalScrollRef}
          horizontal
          data={horizontalData}
          style={{ flexGrow: 0 }}
          bounces={false}
          initialScrollIndex={selected}
          initialNumToRender={4}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            marginBottom: 15,
            justifyContent: "flex-end",
          }}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ marginRight: 10 }} />}
          keyExtractor={(item: any, index: number) => `horizontal-${index}`}
          renderItem={({ item, index }: { item: any; index: number }) => (
            <Tag
              onPress={() => onItemPress(index)}
              {...item}
              selected={index === selected}
            />
          )}
          scrollEnabled={true}
          scrollEventThrottle={16}
          decelerationRate="fast"
          snapToAlignment="center"
          removeClippedSubviews={true}
        />
      </View>
      <View>
        <GroupManagersList />
      </View>

      <View
        style={{ flex: 1 }}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setContentHeight(height);
          // Clear any existing timer
          if (layoutTimerRef.current) {
            clearTimeout(layoutTimerRef.current);
          }
          // Mark layout as ready after a brief delay to ensure FlatList has rendered
          layoutTimerRef.current = setTimeout(() => {
            setIsLayoutReady(true);
            layoutTimerRef.current = null;
          }, 50);
        }}
      >
        <FlatList
          ref={verticalScrollRef}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          initialNumToRender={3}
          onScroll={(event: any) => {
            const newIndex = Math.round(
              event.nativeEvent.contentOffset.x / screenWindow.width,
            );
            if (horizontalScrollRef.current) {
              try {
                horizontalScrollRef.current.scrollToIndex({
                  index: newIndex,
                  animated: true,
                  viewPosition: 0.5,
                });
              } catch (error) {
                // Silently fail if component is unmounting
              }
            }
            setSelected(newIndex);
          }}
          onScrollToIndexFailed={(info: {
            index: number;
            highestMeasuredFrameIndex: number;
            averageItemLength: number;
          }) => {
            // Handle scroll to index failure gracefully
            // Use scrollToOffset as fallback since it's more reliable
            if (verticalScrollRef.current) {
              const offset = info.index * screenWindow.width;
              verticalScrollRef.current.scrollToOffset({
                offset,
                animated: true,
              });
            }
          }}
          data={verticalData}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={true}
          scrollEventThrottle={16}
          keyExtractor={(item: any, index: number) =>
            `vertical-${item.id || index}`
          }
          getItemLayout={(_data: any, index: number) => ({
            length: screenWindow.width,
            offset: screenWindow.width * index,
            index,
          })}
          removeClippedSubviews={false}
          contentContainerStyle={{
            marginBottom: Math.max(Number(insets.bottom), 15),
          }}
          renderItem={({ item, index }: { item: any; index: number }) => (
            <View
              style={{
                width: screenWindow.width,
                height:
                  contentHeight ||
                  screenWindow.height - (insets.top + insets.bottom + 200),
              }}
            >
              {item.component}
            </View>
          )}
        />
      </View>
    </CustomSafeAreaView>
  );
}
