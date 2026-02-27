import NoContentPlaceholder from "@/components/no-content-placeholder";
import { FlatList, Pressable, Text } from "react-native";

interface SectionListProps {
  data: {
    id: string;
    title: string;
    photo?: string;
    phone_number?: string;
    number_of_members?: number;
  }[];
  callback?: (id: string, title: string) => void;
  renderItem?: (item: {
    id: string;
    title: string;
    photo?: string;
    phone_number?: string;
    number_of_members?: number;
  }) => React.ReactNode;
  bottomPadding?: number;
  emptyMessage?: string;
}

export default function SectionList({
  data,
  callback,
  renderItem,
  bottomPadding = 0,
  emptyMessage,
}: SectionListProps) {
  return (
    <FlatList
      keyExtractor={(item: { id: string; title: string }) => item.id.toString()}
      contentContainerStyle={{
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: bottomPadding,
      }}
      ListEmptyComponent={() => (
        <NoContentPlaceholder message={emptyMessage || "Nenhum conteúdo"} />
      )}
      showsVerticalScrollIndicator={false}
      data={data}
      renderItem={({ item }: { item: { id: string; title: string } }) => {
        return (
          <Pressable
            onPress={() => {
              if (callback) {
                callback(item.id, item.title);
              }
            }}
            style={{ width: "100%" }}
          >
            {renderItem ? renderItem(item) : <Text>{item.title}</Text>}
          </Pressable>
        );
      }}
    />
  );
}
