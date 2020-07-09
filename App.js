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
  Switch,
  TextInput,
  Linking,
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
import productJSON from "./data.json";
import Communications from "react-native-communications";
import axios from "axios";

let json = [];

const getS3JSON = () => {
  fetch(
    "https://elasticbeanstalk-us-east-2-431977706224.s3.us-east-2.amazonaws.com/data.json"
  )
    .then((response) => response.json())
    .then((jsonData) => {
      // jsonData is parsed json object received from url
      return jsonData.data;
    })
    .catch((error) => {
      // handle your errors here
      console.error(error);
    });
};

console.log(getS3JSON());

// Sample data from Loblaws Kanata (id=UPC code)
const data = productJSON.data;
// Disale Expo warnings in the app
console.disableYellowBox = true;
// Items the user added to the grocery list
const selectedItems = [];
// Colour references
const colors = {
  red: "#EC2379",
  blue: "#0070FF",
  gray: "#777777",
  white: "#ffffff",
  black: "#000000",
  green: "#00ff7f",
  dark: "#1a1a1a",
};
// Card swipe transitions
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
// Items in the card stack
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

const keyExtractor = (item, index) => index.toString();
// Keys to display when the list is exported
const productKeys = ["Category", "Name", "Price", "QTY"];
// Card swiper/transition
const swiperRef = React.createRef();
const transitionRef = React.createRef();
// Array of product information
const tableRows = [];

export default function App() {
  // ---- STATE -----
  const [index, setIndex] = React.useState(0); // Card index
  const [groceryList, setListData] = React.useState([]); // Final array of selected items
  // Incrementor popup
  const [addPopupVisible, setVisible] = React.useState(false);
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
  // Dark Mode toggle
  const [darkMode, setDarkMode] = React.useState(false);
  // Email dialog
  const [emailDialogVisible, setEmailDialogVisible] = React.useState(false);
  const [categoryEnabled, setCategoryEnabled] = React.useState(false);
  const [emailTo, setEmailTo] = React.useState("sample@gmail.com");
  // WhatsApp dialog
  const [whatsAppDialogVisible, setWhatsAppDialogVisible] = React.useState(
    false
  );
  const [whatsAppTo, setWhatsAppTo] = React.useState("");

  const filteredData = data.filter((item) => {
    return item.name.toLowerCase().includes(search.toString().toLowerCase());
  });

  //-----------------
  // The product list in the quick-add menu
  const renderItem = ({ item }) => (
    <ListItem
      Component={TouchableScale}
      containerStyle={{
        backgroundColor: darkMode ? colors.dark : colors.white,
      }}
      titleStyle={{
        color: darkMode ? colors.white : colors.black,
        fontFamily: "Avenir-Light",
      }}
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
            onChange={(value) => {
              item.quantity = value;
              setQuantity(value);
            }}
            totalWidth={80}
            totalHeight={40}
            iconSize={25}
            step={1}
            valueType="real"
            rounded
            textColor={darkMode ? colors.white : "#000"}
            iconStyle={{ color: darkMode ? colors.dark : colors.white }}
            rightButtonBackgroundColor={colors.green}
            leftButtonBackgroundColor={colors.green}
            containerStyle={{
              backgroundColor: darkMode ? "#404040" : colors.white,
            }}
            maxValue={10}
            minValue={1}
            initValue={1}
            borderColor={darkMode ? colors.dark : colors.white}
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
  // Moves to next item in the array with each swipe
  const onSwiped = () => {
    transitionRef.current.animateNextTransition();
    setIndex((index + 1) % data.length);
    // Check if the list is done and notify user if yes
    setEndPopup(index + 1 == data.length);
  };
  // Add item to list when swiped right or quick-added
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
  // Display the incrementor when the item is tapped
  const onTapCard = () => {
    setVisible(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log(data[index]);
  };
  // Detect a change in the search query and update the state
  const updateSearch = (search) => {
    setSearch(search);
  };
  // Clear the search text when the menu is closed
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
          /* remove item */
          alert(data);
        }}
      />
    </View>
  );
  // Product name and price appear below the card
  const CardDetails = ({ index }) => (
    <View style={styles.cardDetails} key={data[index].id}>
      <Text
        style={{
          fontFamily: "Avenir-Light",
          fontSize: 33,
          color: darkMode ? colors.white : colors.black,
        }}
      >
        {data[index].name}
      </Text>
      <Text style={[styles.text, styles.price]}>{data[index].price}</Text>
    </View>
  );
  const calculateCost = () => {
    let cost = 0;
    selectedItems.forEach((item) => {
      cost += item.price;
    });
    return cost;
  };
  const generateEmail = () => {
    let emailBody = "Here is your grocery list:\\n-----------------\\n";
    let listIndex = 1;
    selectedItems.forEach((item) => {
      emailBody +=
        listIndex.toString() +
        ". " +
        (categoryEnabled ? "[" + item.category + "]" : "") +
        item.name +
        "\\n";
      listIndex++;
    });
    emailBody += "\\n(Generated by the ListMaker App!)";
    return emailBody;
  };
  const generateWhatsApp = () => {
    let body = "Here is your grocery list:\n-----------------\n";
    let listIndex = 1;
    selectedItems.forEach((item) => {
      body +=
        listIndex.toString() +
        ". " +
        (categoryEnabled ? "[" + item.category + "]" : "") +
        item.name +
        "\n";
      listIndex++;
    });
    body += "\n(Generated by the ListMaker App!)";
    return body;
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: darkMode ? colors.dark : colors.white,
      }}
    >
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
        <MaterialCommunityIcons.Button
          name="theme-light-dark"
          size={44}
          backgroundColor="transparent"
          underlayColor="transparent"
          activeOpacity={0.3}
          color={darkMode ? colors.white : colors.black}
          onPress={() => {
            setDarkMode(!darkMode);
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
        dialogTitle={
          <DialogTitle
            title="Grocery List"
            style={{ backgroundColor: darkMode ? "#262626" : colors.white }}
            textStyle={{ color: darkMode ? colors.white : colors.dark }}
          />
        }
        dialogAnimation={
          new SlideAnimation({
            slideFrom: "bottom",
          })
        }
        height={597}
        width={350}
      >
        <DialogContent
          style={{
            backgroundColor: darkMode ? colors.dark : colors.white,
          }}
        >
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
                  color: darkMode ? colors.white : colors.dark,
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
                  setWhatsAppDialogVisible(true);
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
                  setEmailDialogVisible(true);
                }}
              />
              <Dialog
                visible={emailDialogVisible}
                width={300}
                onTouchOutside={() => {
                  setEmailDialogVisible(false);
                }}
                dialogTitle={<DialogTitle title="Email Preferences" />}
                dialogAnimation={
                  new SlideAnimation({
                    slideFrom: "bottom",
                  })
                }
                footer={
                  <DialogFooter>
                    <DialogButton
                      text="Send"
                      onPress={() => {
                        Communications.email(
                          [emailTo, null],
                          null,
                          null,
                          "Grocery List",
                          generateEmail()
                        );
                      }}
                      style={{ backgroundColor: colors.green }}
                      textStyle={{ color: colors.black }}
                    />
                    <DialogButton
                      text="Cancel"
                      onPress={() => {
                        setEmailDialogVisible(false);
                      }}
                      style={{ backgroundColor: colors.green }}
                      textStyle={{ color: colors.black }}
                    />
                  </DialogFooter>
                }
              >
                <DialogContent style={styles.popup}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      margin: 10,
                    }}
                  >
                    <Text style={{ margin: 10 }}>Send To:</Text>
                    <TextInput
                      numberOfLines={1}
                      onChangeText={(text) => {
                        setEmailTo(text);
                      }}
                      value={emailTo}
                      autoCompleteType={"email"}
                      clearTextOnFocus={true}
                      textContentType={"emailAddress"}
                      style={{ borderWidth: 1, padding: 10 }}
                      width={160}
                    ></TextInput>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      margin: 10,
                    }}
                  >
                    <Text style={{ margin: 10 }}>Include category:</Text>

                    <Switch
                      trackColor={{ false: colors.red, true: colors.green }}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => setCategoryEnabled(!categoryEnabled)}
                      value={categoryEnabled}
                    />
                  </View>
                </DialogContent>
              </Dialog>
              <Dialog
                visible={whatsAppDialogVisible}
                width={300}
                onTouchOutside={() => {
                  setWhatsAppDialogVisible(false);
                }}
                dialogTitle={<DialogTitle title="Send a WhatsApp message" />}
                dialogAnimation={
                  new SlideAnimation({
                    slideFrom: "bottom",
                  })
                }
                footer={
                  <DialogFooter>
                    <DialogButton
                      text="Send"
                      onPress={() => {
                        Linking.openURL(
                          "whatsapp://send?text=" +
                            generateWhatsApp() +
                            "&phone=1" +
                            whatsAppTo
                        );
                      }}
                      style={{ backgroundColor: colors.green }}
                      textStyle={{ color: colors.black }}
                    />
                    <DialogButton
                      text="Cancel"
                      onPress={() => {
                        setWhatsAppDialogVisible(false);
                      }}
                      style={{
                        backgroundColor: colors.green,
                        borderColor: colors.black,
                      }}
                      textStyle={{ color: colors.black }}
                    />
                  </DialogFooter>
                }
              >
                <DialogContent style={styles.popup}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      margin: 10,
                    }}
                  >
                    <Text style={{ margin: 10 }}>Send To:</Text>
                    <TextInput
                      numberOfLines={1}
                      onChangeText={(text) => {
                        setWhatsAppTo(text);
                      }}
                      value={whatsAppTo}
                      keyboardType={"phone-pad"}
                      clearTextOnFocus={true}
                      style={{ borderWidth: 1, padding: 10 }}
                      width={160}
                    ></TextInput>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                      margin: 10,
                    }}
                  >
                    <Text style={{ margin: 10 }}>Include category:</Text>

                    <Switch
                      trackColor={{ false: colors.red, true: colors.green }}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => setCategoryEnabled(!categoryEnabled)}
                      value={categoryEnabled}
                    />
                  </View>
                </DialogContent>
              </Dialog>
            </View>
            <View style={{ height: 400 }}>
              <ScrollView>
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
          </View>
          <View>
            <Text>
              Total Estimated Cost: ${calculateCost()} + $
              {Math.round(calculateCost() * 0.13 * 100) / 100} HST
            </Text>
          </View>
        </DialogContent>
      </Dialog>
      <Dialog
        visible={addPopupVisible}
        onTouchOutside={() => {
          setVisible(false);
        }}
        style={{ width: 30 }}
        footer={
          <DialogFooter>
            <DialogButton
              text="Done"
              onPress={() => {
                setVisible(false);
              }}
              style={{ backgroundColor: colors.green }}
              textStyle={{ color: colors.black }}
            />
          </DialogFooter>
        }
      >
        <DialogContent style={styles.popup}>
          <View style={{ marginTop: 20, marginBottom: 20 }}>
            <NumericInput
              onChange={(value) => {
                data[index].quantity = value;
              }}
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
        dialogTitle={
          <DialogTitle
            title="Quick-Add"
            textStyle={{ color: darkMode ? colors.white : colors.dark }}
            style={{ backgroundColor: darkMode ? "#333333" : colors.white }}
          />
        }
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
        <DialogContent
          style={[
            styles.popup,
            { backgroundColor: darkMode ? colors.dark : colors.white },
          ]}
        >
          <View
            style={{
              width: 300,
            }}
          >
            <SearchBar
              placeholder="Search for a Product..."
              onChangeText={updateSearch}
              inputStyle={{ fontFamily: "Avenir-Light" }}
              value={search}
              lightMode={!darkMode}
              containerStyle={{
                backgroundColor: darkMode ? colors.dark : colors.white,
              }}
              inputContainerStyle={{
                backgroundColor: darkMode ? "#404040" : "#f2f2f2",
              }}
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
  popupDark: {
    backgroundColor: "#1a1a1a",
  },
  popupLight: {
    backgroundColor: colors.white,
  },
});
