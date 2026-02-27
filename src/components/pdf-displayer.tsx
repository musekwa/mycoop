import { colors } from "@/constants/colors";
import { sharePDF } from "@/helpers/pdf";
import { useActionStore } from "@/store/actions/actions";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import Pdf from "react-native-pdf";

export default function PdfDisplayer() {
  const { getPdfUri, setPdfUri } = useActionStore();

  return (
    <View className="flex-1">
      <Pdf
        source={{ uri: getPdfUri(), cache: true }}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`number of pages: ${numberOfPages}`);
        }}
        onPageChanged={(page, numberOfPages) => {
          console.log(`current page: ${page}`);
        }}
        onError={(error) => {
          console.log(error);
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          height: "100%",
          width: "100%",
        }}
      />
      <View>
        <TouchableOpacity
          onPress={() => {
            setPdfUri("");
          }}
          className="absolute top-0 right-0 m-4 bg-white dark:bg-black p-2 rounded-full"
        >
          <Ionicons name="close-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        {/* Share this pdf */}
        <TouchableOpacity
          onPress={() => {
            // share the pdf
            sharePDF(getPdfUri());
          }}
          className="absolute top-0 left-0 m-4 bg-white dark:bg-black p-2 rounded-full"
        >
          <Ionicons
            name="share-social-outline"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
