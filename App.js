import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  YellowBox,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Transitioning, Transition } from "react-native-reanimated";
import Dialog, { DialogContent } from "react-native-popup-dialog";
import NumericInput from "react-native-numeric-input";
import * as Haptics from "expo-haptics";
import { Colors } from "react-native/Libraries/NewAppScreen";

const data = [
  {
    id: "713733696142",
    price: 1.99,
    name: "Apple",
    image:
      "https://oppy.com/sites/default/files/styles/large/public/Pink-Lady_hero.png?itok=S69rflgO",
  },
  {
    id: "025293001220",
    price: 3.99,
    name: "Silk Coconut Milk",
    image:
      "https://e22d0640933e3c7f8c86-34aee0c49088be50e3ac6555f6c963fb.ssl.cf2.rackcdn.com/0025293002280_CL_default_default_large.jpeg",
  },
];

console.disableYellowBox = true;

// Itsme the user swiped right on
const selectedItems = [];

const colors = {
  red: "#EC2379",
  blue: "#0070FF",
  gray: "#777777",
  white: "#ffffff",
  black: "#000000",
  green: "#00ff7f",
};

const duration = 200;
const transition = (
  <Transition.Sequence>
    <Transition.Out
      type="slide-bottom"
      durationMs={duration}
      interpolation="easeIn"
    />
    <Transition.Together>
      <Transition.In type="fade" durationMs={duration} delayMs={duration / 2} />
      <Transition.In
        type="slide-bottom"
        durationMs={duration}
        delayMs={duration / 2}
        interpolation="easeOut"
      />
    </Transition.Together>
  </Transition.Sequence>
);

const Card = ({ card }) => (
  <View style={styles.card}>
    <Image source={{ uri: card.image }} style={styles.cardImage} />
  </View>
);

const CardDetails = ({ index }) => (
  <View style={styles.cardDetails} key={data[index].id}>
    <Text style={[styles.text, styles.name]}>{data[index].name}</Text>
    <Text style={[styles.text, styles.price]}>{data[index].price}</Text>
  </View>
);

const swiperRef = React.createRef();
const transitionRef = React.createRef();

export default function App() {
  const [index, setIndex] = React.useState(0);
  const [addPopupVisible, setVisible] = React.useState(false);

  const onSwiped = () => {
    transitionRef.current.animateNextTransition();
    setIndex((index + 1) % data.length);
  };
  const onSwipedRight = () => {
    selectedItems.push(data[index]);
    console.log(data[index]);
  };
  const onTapCard = () => {
    setVisible(true);
    Haptics.selectionAsync();
    console.log(data[index]);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Dialog
        visible={addPopupVisible}
        onTouchOutside={() => {
          setVisible(false);
        }}
      >
        <DialogContent>
          <NumericInput
            onChange={(value) => console.log(value)}
            totalWidth={240}
            totalHeight={50}
            iconSize={25}
            step={1}
            valueType="real"
            rounded
            textColor="#000"
            iconStyle={{ color: "white" }}
            rightButtonBackgroundColor={colors.green}
            leftButtonBackgroundColor={colors.red}
            maxValue={10}
            minValue={1}
            style={{ paddingTop: 40 }}
          />
        </DialogContent>
      </Dialog>
      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={data}
          cardIndex={index}
          renderCard={(card) => <Card card={card} />}
          onSwiped={onSwiped}
          onSwipedRight={onSwipedRight}
          onTapCard={onTapCard}
          stackSize={2}
          stackScale={10}
          stackSeparation={14}
          disableTopSwipe
          disableBottomSwipe
          animateOverlayLabelsOpacity
          animateCardOpacity
          infinite
          backgroundColor={"transparent"}
          overlayLabels={{
            left: {
              title: "Don't need it",
              style: {
                label: {
                  backgroundColor: colors.red,
                  color: colors.white,
                  fontSize: 24,
                },
                wrapper: {
                  flexDirection: "column",
                  alignItems: "flex-end",
                  justifyContent: "flex-start",
                  marginTop: 20,
                  marginLeft: -20,
                },
              },
            },
            right: {
              title: "Add to List!",
              style: {
                label: {
                  backgroundColor: colors.green,
                  color: colors.white,
                  fontSize: 24,
                },
                wrapper: {
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  marginTop: 20,
                  marginLeft: 20,
                },
              },
            },
          }}
        />
      </View>
      <View style={styles.bottomContainer}>
        <Transitioning.View ref={transitionRef} transition={transition}>
          <CardDetails index={index} />
        </Transitioning.View>
        <View style={styles.bottomContainerButtons}>
          <MaterialCommunityIcons.Button
            name="cart-remove"
            size={94}
            backgroundColor="transparent"
            underlayColor="transparent"
            activeOpacity={0.3}
            color={colors.red}
            onPress={() => swiperRef.current.swipeLeft()}
          />
          <MaterialCommunityIcons.Button
            name="cart-plus"
            size={94}
            backgroundColor="transparent"
            underlayColor="transparent"
            activeOpacity={0.3}
            color={colors.green}
            onPress={() => swiperRef.current.swipeRight()}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  swiperContainer: {
    flex: 0.55,
  },
  bottomContainer: {
    flex: 0.45,
    justifyContent: "space-evenly",
  },
  bottomContainerMeta: { alignContent: "flex-end", alignItems: "center" },
  bottomContainerButtons: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  cardImage: {
    width: 160,
    flex: 1,
    resizeMode: "contain",
  },
  card: {
    flex: 0.45,
    borderRadius: 8,
    shadowRadius: 25,
    shadowColor: colors.black,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 0 },
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  text: {
    textAlign: "center",
    fontSize: 50,
    backgroundColor: "transparent",
  },
  done: {
    textAlign: "center",
    fontSize: 30,
    color: colors.white,
    backgroundColor: "transparent",
  },
  text: { fontFamily: "Avenir-Light", fontSize: 22 },
  heading: { fontSize: 24, marginBottom: 10, color: colors.gray },
  price: { color: colors.green, fontSize: 32, fontWeight: "500" },
  cardDetails: {
    alignItems: "center",
  },
});
