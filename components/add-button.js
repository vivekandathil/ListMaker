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
import { Colors } from "react-native/Libraries/NewAppScreen";
import {
  SearchBar,
  ListItem,
  Card,
  Header,
  Badge,
  CheckBox,
} from "react-native-elements";
import TouchableScale from "react-native-touchable-scale";
import {
  Table,
  TableWrapper,
  Row,
  Rows,
  Col,
  Cols,
  Cell,
} from "react-native-table-component";
import Communications from "react-native-communications";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { SwipeListView } from "react-native-swipe-list-view";

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
}) => {
  return (
    <DialogButton
      style={{ backgroundColor: colors.green }}
      textStyle={{
        color: colors.black,
        fontFamily: "Avenir-Light",
      }}
      text={
        "Add " +
        quantity +
        " " +
        (profileData.name.length <= 6
          ? profileData.name
          : profileData.name.slice(0, 5) + "...") +
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
                upc: flavour.id,
                name: profileData.name + ": " + flavour.name,
                price: flavour.price,
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
        setFlavourQuantity(0);
        setProfileVisible(false);
      }}
    />
  );
};

export default AddProductButton;
