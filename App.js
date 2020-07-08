import { StatusBar } from "expo-status-bar";
import React from "react";
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
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
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
  Overlay,
  ListItem,
  Card,
  Badge,
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

const data = [
  {
    id: "713733696142",
    price: 1.99,
    name: "Apple",
    information: "Pink Lady or Honeycrisp",
    image:
      "https://oppy.com/sites/default/files/styles/large/public/Pink-Lady_hero.png?itok=S69rflgO",
    category: "Fruit-Veg",
    quantity: 1,
  },
  {
    id: "021248000072",
    price: 1.45,
    name: "Banana",
    information: "",
    image:
      "http://2.bp.blogspot.com/-pU8BDUCR3Sg/UDZQmt4IcdI/AAAAAAAAACA/T5rq7xIKLek/s1600/Banana.png",
    category: "Fruit-Veg",
    quantity: 1,
  },
  {
    id: "715756100040",
    price: 3.99,
    name: "Raspberries",
    information: "",
    image:
      "https://www.driscolls.pt/assets/styles/block_product_display/public/content/block/image/isa_2754_frambozen-125gr-zijkant-lowres.png?itok=W5LBTWau",
    category: "Fruit-Veg",
    quantity: 1,
  },
  {
    id: "715756300129",
    price: 3.99,
    name: "Blueberries",
    information: "",
    image:
      "https://0bb8856ba8259ec33e3d-a40599a114f3a4c6d0979c3ffe0b2bf5.ssl.cf2.rackcdn.com/0715756300020_CL_hyvee_default_large.png",
    category: "Fruit-Veg",
    quantity: 1,
  },
  {
    id: "063100231545",
    price: 3.69,
    name: "Canned Chicken",
    information: "Maple Leaf Flakes of Chicken",
    image:
      "https://az836796.vo.msecnd.net/media/image/product/en/medium/0006310023154.jpg",
    category: "Meat",
    quantity: 1,
  },
  {
    id: "025293001220",
    price: 3.99,
    name: "Silk Coconut Milk",
    information: "In the Allergy-Free section",
    image:
      "https://e22d0640933e3c7f8c86-34aee0c49088be50e3ac6555f6c963fb.ssl.cf2.rackcdn.com/0025293002280_CL_default_default_large.jpeg",
    category: "Dairy-Egg",
    quantity: 1,
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

const GroceryCard = ({ card }) => (
  <View style={styles.card}>
    <Image source={{ uri: card.image }} style={styles.cardImage} />
    <Badge
      status="success"
      containerStyle={{ position: "absolute", top: -5, right: -5 }}
      badgeStyle={
        selectedItems.includes(card)
          ? { backgroundColor: "green" }
          : { backgroundColor: "transparent" }
      }
      value={selectedItems.includes(card) ? "Added" : ""}
    />
  </View>
);

const CardDetails = ({ index }) => (
  <View style={styles.cardDetails} key={data[index].id}>
    <Text style={[styles.text, styles.name]}>{data[index].name}</Text>
    <Text style={[styles.text, styles.price]}>{data[index].price}</Text>
  </View>
);

const keyExtractor = (item, index) => index.toString();
const productKeys = ["Category", "Name", "Price", "QTY"];

const swiperRef = React.createRef();
const transitionRef = React.createRef();

const tableRows = [];

export default function App() {
  const [index, setIndex] = React.useState(0); // Card index
  const [groceryList, setListData] = React.useState([]); // Card index
  const [addPopupVisible, setVisible] = React.useState(false); // Incrementor popup
  // Product Profile popup in quick-add menu
  const [profileData, setProfileData] = React.useState(data[index]); // Incrementor popup
  const [profileVisible, setProfileVisible] = React.useState(false); // Profile popup
  const [quantity, setQuantity] = React.useState(1);
  // End of the list reached
  const [endOfList, setEndPopup] = React.useState(false); // End of list popup
  // Search data
  const [search, setSearch] = React.useState(""); // Search
  const [searchPopupVisible, setSearchVisible] = React.useState(false); // Incrementor popup
  // Table view
  const [tablePopupVisible, setTableVisible] = React.useState(false); // Incrementor popup

  const filteredData = data.filter((item) => {
    return item.name.toLowerCase().includes(search.toString().toLowerCase());
  });

  const renderItem = ({ item }) => (
    <ListItem
      Component={TouchableScale}
      title={item.name}
      leftAvatar={{
        source: item.image && { uri: item.image },
        name: item.name[0],
      }}
      bottomDivider
      chevron
      onPress={() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setProfileData(item);
        console.log(item.name);
        setProfileVisible(true);
      }}
      rightElement={
        <View>
          <NumericInput
            onChange={(value) => setQuantity(value)}
            totalWidth={80}
            totalHeight={40}
            iconSize={25}
            step={1}
            valueType="real"
            rounded
            textColor="#000"
            iconStyle={{ color: "white" }}
            rightButtonBackgroundColor={colors.green}
            leftButtonBackgroundColor={colors.green}
            maxValue={10}
            minValue={1}
            initValue={1}
          />
          <Badge
            status="success"
            containerStyle={{ position: "absolute", top: -5, right: -5 }}
            badgeStyle={
              selectedItems.includes(item)
                ? { backgroundColor: "green" }
                : { backgroundColor: "transparent" }
            }
            value={selectedItems.includes(item) ? "Added" : ""}
          />
        </View>
      }
    />
  );

  const onSwiped = () => {
    transitionRef.current.animateNextTransition();
    setIndex((index + 1) % data.length);
    // Check if the list is done
    setEndPopup(index + 1 == data.length);
  };
  const onSwipedRight = () => {
    selectedItems.push(data[index]);
    tableRows.push([
      data[index].category,
      data[index].name,
      data[index].price,
      data[index].quantity,
    ]);
    setListData(tableRows);
    console.log(selectedItems);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  const onQuickAdded = () => {
    selectedItems.push(profileData);
    tableRows.push([
      profileData.category,
      profileData.name,
      profileData.price,
      profileData.quantity,
    ]);
    setListData(tableRows);
    console.log(selectedItems);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  const onTapCard = () => {
    setVisible(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log(data[index]);
  };
  const updateSearch = (search) => {
    setSearch(search);
  };
  const clearOverlay = (search) => {
    setSearch("");
  };
  const removeButton = (data, index) => (
    <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
      <View style={{ justifyContent: "center" }}>
        <Text
          style={{
            fontFamily: "Avenir-Light",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {data}
        </Text>
      </View>
      <MaterialCommunityIcons.Button
        name="cart-remove"
        size={24}
        backgroundColor="transparent"
        underlayColor="transparent"
        activeOpacity={0.3}
        color={colors.red}
        onPress={() => {
          alert(data);
        }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
        <MaterialCommunityIcons.Button
          name="magnify"
          size={44}
          backgroundColor="transparent"
          underlayColor="transparent"
          activeOpacity={0.3}
          color={colors.red}
          onPress={() => {
            setSearchVisible(true);
          }}
        />
        <View>
          <MaterialCommunityIcons.Button
            name="format-list-checkbox"
            size={44}
            backgroundColor="transparent"
            underlayColor="transparent"
            activeOpacity={0.3}
            color={colors.green}
            onPress={() => {
              setTableVisible(true);
            }}
          />
          <Badge
            status="error"
            containerStyle={{ position: "absolute", top: -0.5, right: -0.5 }}
            value={selectedItems.length}
          />
        </View>
      </View>
      <Dialog
        visible={tablePopupVisible}
        onTouchOutside={() => {
          setTableVisible(false);
        }}
        dialogTitle={<DialogTitle title="Grocery List" />}
        dialogAnimation={
          new SlideAnimation({
            slideFrom: "bottom",
          })
        }
        height={597}
        width={350}
      >
        <DialogContent>
          <View>
            <View
              style={{
                flexDirection: "row",
                borderBottomWidth: 2,
                borderBottomColor: colors.red,
              }}
            >
              <MaterialCommunityIcons.Button
                name="keyboard-return"
                size={44}
                backgroundColor="transparent"
                underlayColor="transparent"
                activeOpacity={0.3}
                color={colors.red}
                style={{ justifyContent: "flex-start" }}
                onPress={() => {
                  setTableVisible(false);
                }}
              />
              <Text
                style={{
                  fontFamily: "Avenir-Light",
                  fontWeight: "bold",
                  textAlign: "center",
                  marginTop: 20,
                  marginLeft: 20,
                  fontSize: 20,
                }}
              >
                Export Options
              </Text>
            </View>

            <View
              style={{ flexDirection: "row", justifyContent: "space-evenly" }}
            >
              <MaterialCommunityIcons.Button
                name="file-pdf-box"
                size={44}
                backgroundColor="transparent"
                underlayColor="transparent"
                activeOpacity={0.3}
                color={"red"}
                onPress={() => {
                  alert("exported to PDF (not really)");
                }}
              />
              <MaterialCommunityIcons.Button
                name="file-excel"
                size={44}
                backgroundColor="transparent"
                underlayColor="transparent"
                activeOpacity={0.3}
                color={"green"}
                onPress={() => {
                  alert("exported to Excel (not really)");
                }}
              />
              <MaterialCommunityIcons.Button
                name="whatsapp"
                size={44}
                backgroundColor="transparent"
                underlayColor="transparent"
                activeOpacity={0.3}
                color={"lawngreen"}
                onPress={() => {
                  alert("exported to WhatsApp (not really)");
                }}
              />
              <MaterialCommunityIcons.Button
                name="email-plus-outline"
                size={44}
                backgroundColor="transparent"
                underlayColor="transparent"
                activeOpacity={0.3}
                color={"deepskyblue"}
                onPress={() => {
                  alert("exported to E-Mail (not really)");
                }}
              />
            </View>
            <ScrollView alwaysBounceVertical={false}>
              <Table borderStyle={{ borderWidth: 1, borderColor: "#C1C0B9" }}>
                <Row
                  data={productKeys}
                  style={{ height: 40, backgroundColor: colors.green }}
                  textStyle={{
                    fontFamily: "Avenir-Light",
                    fontWeight: "bold",
                    textAlign: "center",
                    margin: 9,
                  }}
                />
                {groceryList.map((rowData, index) => (
                  <TableWrapper
                    key={index}
                    style={{
                      flexDirection: "row",
                      backgroundColor: colors.white,
                    }}
                  >
                    {rowData.map((cellData, cellIndex) => (
                      <Cell
                        key={cellIndex}
                        data={
                          cellIndex === 3
                            ? removeButton(cellData, index)
                            : cellData
                        }
                        textStyle={{
                          fontFamily: "Avenir-Light",
                          textAlign: "center",
                        }}
                      />
                    ))}
                  </TableWrapper>
                ))}
              </Table>
            </ScrollView>
          </View>
        </DialogContent>
      </Dialog>
      <Dialog
        visible={addPopupVisible}
        onTouchOutside={() => {
          setVisible(false);
        }}
        style={{ width: 30 }}
      >
        <DialogContent style={styles.popup}>
          <View style={{ marginTop: 20, marginBottom: 20 }}>
            <Text>{data[index].information}</Text>
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
              initValue={1}
            />
          </View>
        </DialogContent>
      </Dialog>
      <Dialog visible={endOfList}>
        <DialogContent style={styles.popup}>
          <Text>You have reached the end of the stack</Text>
          <Button title="Review/Export Grocery List" />
          <Button
            title="Return to Stack"
            onPress={() => {
              setEndPopup(false);
            }}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        visible={searchPopupVisible}
        onTouchOutside={() => {
          setSearchVisible(false);
          setSearch("");
        }}
        dialogTitle={<DialogTitle title="Quick-Add" />}
        dialogAnimation={
          new SlideAnimation({
            slideFrom: "bottom",
          })
        }
        footer={
          <DialogFooter>
            <DialogButton
              text="Done"
              onPress={() => {
                setSearchVisible(false);
                setSearch("");
              }}
              style={{ backgroundColor: colors.green }}
              textStyle={{ color: colors.black }}
            />
          </DialogFooter>
        }
        height={597}
      >
        <DialogContent style={styles.popup}>
          <View style={{ width: 300 }}>
            <SearchBar
              placeholder="Search for a Product..."
              onChangeText={updateSearch}
              value={search}
              lightTheme
              containerStyle={{ backgroundColor: "white" }}
              inputContainerStyle={{ backgroundColor: "#f2f2f2" }}
              onClear={clearOverlay}
            />
            <Dialog
              visible={profileVisible}
              onTouchOutside={() => {
                setProfileVisible(false);
              }}
            >
              <DialogContent style={styles.popup}>
                <Card
                  title={profileData.name}
                  image={{ uri: profileData.image }}
                  imageStyle={{ height: 300, width: 300 }}
                >
                  <Text
                    style={{ fontFamily: "Avenir-Light", marginBottom: 10 }}
                  >
                    {profileData.name}{" "}
                    {profileData.name.endsWith("s") ? "are" : "is"} in the{" "}
                    {profileData.category} category and cost
                    {profileData.name.endsWith("s") ? "" : "s"} $
                    {profileData.price} per unit.
                  </Text>
                </Card>
                <Button
                  color={colors.green}
                  title={
                    "Add " + quantity + " " + profileData.name + " to list"
                  }
                  onPress={() => {
                    onQuickAdded();
                    setProfileVisible(false);
                  }}
                />
              </DialogContent>
            </Dialog>
            <FlatList
              keyExtractor={keyExtractor}
              data={filteredData}
              renderItem={renderItem}
            />
          </View>
        </DialogContent>
      </Dialog>
      <View style={styles.topContainer}></View>
      <View style={styles.swiperContainer}>
        <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
          <Text style={styles.outof}>
            {index + 1}/{data.length}
          </Text>
        </View>
        <Swiper
          ref={swiperRef}
          cards={data}
          cardIndex={index}
          renderCard={(card) => <GroceryCard card={card} />}
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
    flex: 0.58,
  },
  bottomContainer: {
    flex: 0.35,
    justifyContent: "space-evenly",
  },
  topContainer: {
    flex: 0.03,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
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
  text: { fontFamily: "Avenir-Light", fontSize: 33 },
  heading: { fontSize: 24, marginBottom: 10, color: colors.gray },
  price: { color: colors.green, fontSize: 32, fontWeight: "500" },
  outof: {
    textAlign: "center",
    fontFamily: "Avenir-Light",
    fontSize: 26,
    color: "#dc143c",
  },
  cardDetails: {
    alignItems: "center",
  },
  popup: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});
