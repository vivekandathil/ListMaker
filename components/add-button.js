import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  YellowBox,
  Button,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Linking,
  Alert,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { MaterialCommunityIcons, Fontisto } from "@expo/vector-icons";
import { Transitioning, Transition } from "react-native-reanimated";
import Dialog, {
  DialogContent,
  DialogTitle,
  SlideAnimation,
  DialogFooter,
  DialogButton,
} from "react-native-popup-dialog";
import NumericInput from "react-native-numeric-input";
import * as Haptics from "expo-haptics";

const AddProductButton = ({
  profileData,
  colors,
  selectedItems,
  onQuickAdded,
  setListData,
  setQuantity,
  setFlavourQuantity,
  setProfileVisible,
  tableRows,
  quantity,
  swiperRef,
}) => {
  return (
    <DialogButton
      style={{
        backgroundColor: colors.red,
        borderWidth: 1,
        borderColor: "#ff6666",
      }}
      textStyle={{
        color: "white",
        fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light",
      }}
      text={
        "Add " +
        (profileData.options === undefined ? "(" + quantity + ")" : "All") +
        " to List"
      }
      onPress={() => {
        if (profileData.options === undefined) {
          onQuickAdded();

          setQuantity(1);
        } else {
          profileData.options.flavours.forEach((flavour) => {
            if (flavour.quantity > 0) {
              const obj = {
                upc: flavour.id.toString(),
                category: profileData.category,
                name: profileData.name + ": " + flavour.name,
                price: flavour.price,
                image: flavour.image,
                quantity: flavour.quantity,
                store: profileData.store,
              };
              selectedItems.push(obj);
              tableRows.push([
                profileData.category,
                obj.name,
                obj.price,
                obj.quantity,
              ]);
              setListData(tableRows);
              console.log(selectedItems);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          });
        }
        if (swiperRef !== undefined) {
          swiperRef.current.swipeLeft();
        }
        setFlavourQuantity(0);
        setProfileVisible(false);
      }}
    />
  );
};

export default AddProductButton;
