import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  YellowBox,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Linking,
  Alert,
  Platform,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
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
  Overlay,
  Button,
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
import productJSON from "./data.json";
import Communications from "react-native-communications";
import axios from "axios";
import Profile from "./components/profile.js";
import AddProductButton from "./components/add-button.js";
import { Camera } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { LinearGradient } from 'expo-linear-gradient';

import InstructionPopup from "./components/instructions.js";
import AnimatedEllipsis from 'react-native-animated-ellipsis';

import * as Print from "expo-print";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";

//import MessageDialog from './components/message-settings-dialog';
// <MessageDialog generateSMS={generateSMS} visible={SMSDialogVisible} styles={styles} setVisible={setSMSDialogVisible}/>

// Colour references
const colors = {
  red: "#e52d27",
  redLeft: "#b31217",
  blue: "#0070FF",
  gray: "#777777",
  white: "#ffffff",
  black: "#000000",
  green: "#00ff7f",
  purple: "#9b5de5",
  dark: "#1a1a1a",
};

function htmlString() {
  return (`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Grocery List</title>
    <h1><b>Groceries</b> for ${new Date().toJSON().slice(0,10).replace(/-/g,'/')}</h1>
    <style>
    @page { margin: 20px; } 
        h1 {
            text-align: center;
            font-family: Avenir;
            font-weight: normal;
        }
        h3 {
          text-align: center;
          font-family: Avenir-Light;
          font-weight: normal;
        }
        h4 {
          text-align: center;
          font-family: Avenir-Light;
          font-weight: normal;
        }
        #products {
          font-family: "Avenir-Light", Avenir-Light, Avenir-Light, sans-serif;
          border-collapse: collapse;
          font-size: 12px;
          font-weight: normal;
          width: 100%;
          align-items: center;
        }
        
        #products td, #products th {
          border: 1px solid #ddd;
          padding: 8px;
          
        }
        
        #products tr:nth-child(even){background-color: white;}
        
        #products th {
          padding-top: 12px;
          padding-bottom: 12px;
          text-align: center;
          background-color: ${colors.red};
          color: white;
        }

        #tableContainer {
          width: 100% ;
          margin-left: auto ;
          margin-right: auto ;
        }
    </style>
   
</head>
<body>
<div id="tableContainer">
<table id="products">
  <tr>
    <th>Category</th>
    <th>Name</th>
    <th>Price</th>
    <th>Qty.</th>
  </tr>
  ${generateRows()}
</table>
</div>
<h3>Approximate Cost: \$${Math.round(calculateCost() * 100) / 100} +
\$${Math.round(calculateCost() * 0.13 * 100) / 100} HST</h3>
</body>
</html>
`)
};

const createPDF = async (html) => {

  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (Platform.OS === "ios") {
      await Sharing.shareAsync(uri);
    } else {
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.granted) {
        await MediaLibrary.createAssetAsync(uri);
      }
    }
  } catch (error) {
    console.error(error);
  }
};


// Sample data from Loblaws Kanata (id=UPC code)
//const data = productJSON.data;
// Disale Expo warnings in the app
console.disableYellowBox = true;
// Items the user added to the grocery list
let selectedItems = [];

// Generate the HTML for table rows in the PDF
function generateRows() {
  let htmlRows = "";
  selectedItems.forEach((item) => {
    htmlRows += `
    <tr>
      <td>${item.category}</td>
      <td>${item.name}</td>
      <td>\$${item.price.toString()}</td>
      <td>${item.quantity.toString()}</td>
    </tr>
    `
  })
  return htmlRows;
}

const calculateCost = () => {
  let cost = 0;
  selectedItems.forEach((item) => {
    cost += item.price * item.quantity;
  });
  return cost;
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
      containerStyle={{
        position: "absolute",
        top: -5,
        right: -5,
      }}
      badgeStyle={{
        backgroundColor: selectedItems.includes(card) ? "green" : "transparent",
        borderColor: selectedItems.includes(card) ? "lawngreen" : "transparent",
      }}
      value={selectedItems.includes(card) ? "Added" : ""}
    />
  </View>
);

const keyExtractor = (item, index) => index.toString();
// Keys to display when the list is exported
const productKeys = ["Category", "Name", "Price", "QTY"];
const productCategories = [
  "Fruit-Veg",
  "Bread",
  "Meat",
  "Dairy-Egg",
  "Condiments",
  "Juice",
  "Snacks",
  "Stationery",
];
// Card swiper/transition
const swiperRef = React.createRef();
const tableRef = React.createRef();
const transitionRef = React.createRef();
// Array of product information
let tableRows = [];


export default function App() {
  // load the local JSON in case fetching from S3 bucket fails
  const [data, setData] = React.useState(productJSON.data);


  // fetch product data from an S3 bucket
  useEffect(() => {
    // Start it off by assuming the component is still mounted
    let mounted = true;

    const loadData = async () => {
      const response = await axios.get(
        "http://assets-vjk.s3.amazonaws.com/files/data.json"
      );
      if (mounted) {

        setData(response.data.data);
      }
    };
    loadData();

    return () => {
      // When cleanup is called, toggle the mounted variable to false
      mounted = false;
    };
  }, []); // Empty array = nothing to watch > only run once


  // ---- STATE -----
  const [index, setIndex] = React.useState(0); // Card index
  const [settingsVisible, setSettingsVisible] = React.useState(false); // Card index
  const [groceryList, setListData] = React.useState([]); // Final array of selected items
  // Incrementor popup
  const [addPopupVisible, setVisible] = React.useState(false);
  // Product Profile popup in quick-add menu
  const [profileData, setProfileData] = React.useState(data[index]); // Incrementor popup
  const [profileVisible, setProfileVisible] = React.useState(false); // Profile popup
  const [quantity, setQuantity] = React.useState(1);
  const [flavourQuantity, setFlavourQuantity] = React.useState(0);
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
  const [priceEnabled, setpriceEnabled] = React.useState(false);
  const [emailTo, setEmailTo] = React.useState("sample@gmail.com");
  // WhatsApp dialog
  const [whatsAppDialogVisible, setWhatsAppDialogVisible] = React.useState(
    false
  );
  const [whatsAppTo, setWhatsAppTo] = React.useState("");
  // SMS dialog
  const [SMSDialogVisible, setSMSDialogVisible] = React.useState(false);
  // Table-Card view toggle button
  const [cardView, setCardView] = React.useState(false);
  const [productData, setProductData] = React.useState([]);
  // Instructions
  const [instructionsVisible, setInstructionsVisible] = React.useState(true);
  //-----------------

  // Data to display for the search results
  const filteredData = data.filter((item) => {
    return item.name.toLowerCase().includes(search.toString().toLowerCase());
  });

  // The product list in the quick-add menu
  const renderItem = ({ item }) => (
    <ListItem
      Component={TouchableScale}
      containerStyle={{
        backgroundColor: darkMode ? colors.dark : colors.white,
      }}
      titleStyle={{
        color: darkMode ? colors.white : colors.black,
        fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light",
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
        item.options === undefined ? (
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
              rightButtonBackgroundColor={colors.red}
              leftButtonBackgroundColor={colors.redLeft}
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
              badgeStyle={{
                backgroundColor: selectedItems.includes(item)
                  ? "green"
                  : "transparent",
                borderColor: selectedItems.includes(item)
                  ? "lawngreen"
                  : "transparent",
              }}
              value={selectedItems.includes(item) ? "Added" : ""}
            />
          </View>
        ) : (
            <View>
              <Text style={{ fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Heavy", color: colors.red }}>
                View Options
            </Text>
              <Badge
                status="success"
                containerStyle={{ position: "absolute", top: -5, right: -5 }}
                badgeStyle={{
                  backgroundColor: selectedItems.includes(item)
                    ? "green"
                    : "transparent",
                  borderColor: selectedItems.includes(item)
                    ? "lawngreen"
                    : "transparent",
                }}
                value={selectedItems.includes(item) ? "Added" : ""}
              />
            </View>
          )
      }
    />
  );
  const [movingBack, setMovingBack] = React.useState(false);
  // Moves to next item in the array with each swipe
  const onSwiped = () => {
    transitionRef.current.animateNextTransition();
    setIndex(movingBack ? index : (index + 1) % data.length);
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
    setProfileData(data[index]);
    setQuantity(1);
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
  const removeButton = (num, index) => (
    <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>
      <View style={{ justifyContent: "center" }}>
        <Text
          style={[
            styles.quantityStyle,
            { color: darkMode ? colors.white : colors.black },
          ]}
        >
          {num}
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
          alert("Removed " + selectedItems[index].name + " from list");
          selectedItems.splice(index, 1);
          tableRows.splice(index, 1);
          setListData(tableRows);
          setTableVisible(false);
        }}
      />
    </View>
  );
  // Product name and price appear below the card
  const CardDetails = ({ index }) => (
    <View style={styles.cardDetails} key={data[index].upc}>
      <ListItem
        Component={TouchableScale}
        friction={90} //
        tension={100} // These props are passed to the parent component (here TouchableScale)
        activeScale={0.75} //
        linearGradientProps={{
          colors: ["#93291E", "#F00000"],
          start: [1, 0],
          end: [0.2, 0],
        }}
        title={data[index].name}
        containerStyle={{ borderRadius: 20, width: 300 }}
        titleStyle={{
          color: "white",
          fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Medium",
          fontSize: 30,
        }}
        subtitleStyle={{
          color: "white",
          fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light",
          fontSize: 20,
        }}
        subtitle={
          data[index].price.toString() +
          (data[index].options === undefined
            ? ""
            : " - " + data[index].options.flavours.length + " options/flavours")
        }
        chevron={{ color: "white" }}
        onPress={() => {
          setProfileData(data[index]);
          setQuantity(1);
          setVisible(true);
        }}
      />
    </View>
  );
  const generateEmail = () => {
    let body = "Here is your grocery list:\\n---------------------\\n";
    let listIndex = 1;
    // Don't include a store if there aren't any selected items from that store
    let storeList = sortStores();
    storeList.forEach((store) => {
      body += store + ":\\n-------------------\\n";
      selectedItems.forEach((item) => {
        if (item.store == store) {
          body +=
            listIndex.toString() +
            ". " +
            (priceEnabled ? "[" + item.price.toString() + "]" : "") +
            item.name +
            " (x" +
            item.quantity +
            ")\\n";
          listIndex++;
        }
      });
      body += "\\n----------------------\\n";
    });
    body +=
      "This should cost around $" +
      Math.round(calculateCost() * 1.13 * 100) / 100 +
      " with HST\\n(Generated by the ListMaker App!)";
    return body;
  };
  const generateSMS = () => {
    let body = "Here is your grocery list:\n---------------------\n";
    let listIndex = 1;
    let storeList = sortStores();
    console.log(selectedItems);
    storeList.forEach((store) => {
      body += store + ":\n\n";

      let storeCategories = [];
      productCategories.forEach((category) => {
        let byCategory = [];
        selectedItems.forEach((item) => {
          if (item.store === store) {
            if (item.category === category || item.category === undefined) {
              byCategory.push(item);
            }
          }
        });
        if (byCategory.length !== 0) {
          storeCategories.push(byCategory);
        }
      });
      storeCategories.forEach((category) => {
        body += category[0].category + ":\n";
        category.forEach((item) => {
          body +=
            listIndex.toString() +
            ". " +
            (priceEnabled ? "[" + item.price.toString() + "]" : "") +
            item.name +
            " (x" +
            item.quantity +
            ")\n";
          listIndex++;
        });

        body += "\n";
      });

      body += "\n----------------------\n";
    });
    body +=
      "This should cost around $" +
      Math.round(calculateCost() * 1.13 * 100) / 100 +
      " with HST\n(Generated by the ListMaker App!)";
    return body;
  };
  const generateWhatsApp = () => {
    let body = "*Here is your grocery list:*\n---------------------\n";
    let listIndex = 1;
    let storeList = sortStores();
    console.log(selectedItems);
    storeList.forEach((store) => {
      body += "*" + store + ":*\n\n";

      let storeCategories = [];
      productCategories.forEach((category) => {
        let byCategory = [];
        selectedItems.forEach((item) => {
          if (item.store === store) {
            if (item.category === category || item.category === undefined) {
              byCategory.push(item);
            }
          }
        });
        if (byCategory.length !== 0) {
          storeCategories.push(byCategory);
        }
      });
      storeCategories.forEach((category) => {
        body += "*" + category[0].category + ":*\n";
        category.forEach((item) => {
          body +=
            listIndex.toString() +
            ". " +
            (priceEnabled ? "```[" + item.price.toString() + "]``` " : "") +
            item.name +
            " _(x" +
            item.quantity +
            "_)\n";
          listIndex++;
        });

        body += "\n";
      });

      body += "\n----------------------\n";
    });
    body +=
      "This should cost around $" +
      Math.round(calculateCost() * 1.13 * 100) / 100 +
      " with HST\n(Generated by the ListMaker App!)";
    return body;
  };
  const sortStores = () => {
    // Get a list of all the unique stores in theselected items
    return [...new Set(selectedItems.map((item) => item.store))];
  };

  const [hasPermission, setHasPermission] = React.useState(null);
  const [type, setType] = React.useState(Camera.Constants.Type.back);
  const [cameraOn, setCameraOn] = React.useState(false);
  const [scanned, setScanned] = React.useState(false);

  const [barcode, setBarcode] = React.useState('');
  const [barcodeResult, setBarcodeResult] = React.useState([]);
  const [imageDialogVisible, setImageDialogVisible] = React.useState(false);

  const [imageSearch, setImageSearch] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);

  // fetch product data from a barcode lookup API
  useEffect(() => {
    // Start it off by assuming the component is still mounted
    let mounted = true;

    const loadData = async () => {
      const response = await axios.get(
        `https://api.upcdatabase.org/product/${barcode}?apikey=D0D211A4DA68BA3855C903441D3E78F1`
      );
      if (mounted) {
        setBarcodeResult(response.data);
        console.log(response.data);
      }
    };
    loadData();

    return () => {
      // When cleanup is called, toggle the mounted variable to false
      mounted = false;
    };
  }, [barcode]); // Empty array = nothing to watch > only run once

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setBarcode(data);
    alert(`UPC code: ${data}`);
  };

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }




  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: darkMode ? colors.dark : colors.white,
      }}
    >
      <StatusBar hidden />
      <InstructionPopup data={data} />
      <Overlay isVisible={cameraOn} overlayStyle={{ width: 350, height: '90%' }}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flex: 0.5,
              flexDirection: 'column',
              justifyContent: 'flex-end',
            }}>
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}
            />

            {scanned && <Button title={'SCAN AGAIN'} linearGradientProps={{
              colors: ['#dd1818', '#93291E'],
              start: { x: 0, y: 0.5 },
              end: { x: 1, y: 0.5 },
            }} titleStyle={{ fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light" }} onPress={() => setScanned(false)} />}
          </View>

          <TouchableScale onPress={() => {
            alert('hello');
          }} style={{ flex: 0.5, marginTop: 10, borderWidth: 2, padding: 10, borderRadius: 8, borderColor: "#990000" }}>
            <Overlay
              isVisible={imageDialogVisible}
              onBackdropPress={() => setImageDialogVisible(false)}
            >
              <Text>Currently Unavailable</Text>
            </Overlay>
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', margin: 10 }}>
              <Text style={{ fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light", textAlign: 'center', fontSize: 16, marginTop: 10 }}>NAME: </Text>
              <TextInput
                style={{ height: 40, borderColor: "#990000", borderWidth: 1, borderWidth: 2, borderRadius: 10, color: colors.red, padding: 10, fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light", backgroundColor: 'white', width: 240 }}
                onChangeText={text => alert('hi')}
                value={barcodeResult.title == "" ? barcodeResult.description : barcodeResult.title}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
              <Text style={{ fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light", textAlign: 'center', fontSize: 16, marginTop: 10 }}>PRICE: </Text>
              <TextInput
                style={{ height: 40, borderColor: "#990000", borderWidth: 1, borderWidth: 2, borderRadius: 10, color: colors.red, padding: 10, fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light", backgroundColor: 'white', width: 240 }}
                onChangeText={text => alert('hi')}
                value={barcodeResult.msrp == "0.00" ? "" : barcodeResult.msrp}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly', margin: 10 }}>
              <Text style={{ fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light", textAlign: 'center', fontSize: 16, marginTop: 10 }}>IMAGE: </Text>

              <Button
                ViewComponent={LinearGradient}
                linearGradientProps={{
                  colors: ['#dd1818', '#93291E'],
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }}
                buttonStyle={{ width: 100, height: 40 }}
                title={"Custom URI"}
                titleStyle={{ fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light", fontSize: 16 }}
                onPress={() => {
                  setImageDialogVisible(true);
                }}
              />
              <Button
                ViewComponent={LinearGradient}
                linearGradientProps={{
                  colors: ['#dd1818', '#93291E'],
                  start: { x: 0, y: 0.5 },
                  end: { x: 1, y: 0.5 },
                }}
                buttonStyle={{ width: 100, height: 40 }}
                title={"Auto Search"}
                titleStyle={{ fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light", fontSize: 16 }}
                onPress={() => {
                  const headers = {
                    'Ocp-Apim-Subscription-Key': 'db989bd0507a44ad9f7f4899ad3d881a',
                  };
                  axios.get('https://api.cognitive.microsoft.com/bing/v7.0/images/search?q=monster+energy+drink+zero+ultra', { headers })
                    .then(response => {
                      setSearchResults(response.data.pivotSuggestions[1].suggestions);
                      console.log(searchResults.length);
                    });
                }}
              />
            </View>
            <Text style={{ fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light", fontSize: 16, color: colors.red }}>{barcodeResult.success ? "* Barcode lookup successful!\nPlease fill any missing details" : "* Barcode lookup failed (404).\nPlease scan again or fill in details manually"}</Text>
          </TouchableScale>
          <TouchableScale style={{margin: 4}} onPress={() => {
              setCameraOn(false);
          }}>
            <MaterialCommunityIcons name="keyboard-return" size={44} color={colors.red} />
          </TouchableScale>
        </View>
      </Overlay>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          marginTop: 6,
        }}
      >
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
        <TouchableOpacity onPress={() => setSettingsVisible(true)}>
          <Image
            source={require("./assets/logo_small.png")}
            style={styles.logoStyle}
          />
        </TouchableOpacity>

        <View>
          <MaterialCommunityIcons.Button
            name="format-list-checkbox"
            size={44}
            backgroundColor="transparent"
            underlayColor="transparent"
            activeOpacity={0.3}
            color={colors.red}
            onPress={() => {
              setTableVisible(true);
            }}
          />
          <Badge
            status="error"
            containerStyle={{ position: "absolute", top: -0.5, right: -0.5 }}
            value={selectedItems.length}
            badgeStyle={{ borderColor: colors.red }}
          />
        </View>
      </View>
      <Dialog
        visible={settingsVisible}
        onTouchOutside={() => {
          setSettingsVisible(false);
        }}
        dialogTitle={
          <DialogTitle
            title="Settings"
            style={{ backgroundColor: darkMode ? "#262626" : colors.white }}
            textStyle={{ color: darkMode ? colors.white : colors.dark }}
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
              onPress={() => setSettingsVisible(false)}
              style={{ backgroundColor: colors.red }}
              textStyle={{ color: colors.black }}
            />
          </DialogFooter>
        }
        height={0.57}
        width={0.8}
      >
        <DialogContent
          style={{
            backgroundColor: darkMode ? colors.dark : colors.white,
          }}
        >
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <MaterialCommunityIcons.Button
              name="theme-light-dark"
              size={64}
              backgroundColor="transparent"
              underlayColor="transparent"
              activeOpacity={0.3}
              color={darkMode ? colors.white : colors.black}
              onPress={() => {
                setDarkMode(!darkMode);
              }}
            />
            <ListItem
              Component={TouchableScale}
              friction={70} //
              tension={100} // These props are passed to the parent component (here TouchableScale)
              activeScale={0.65}
              containerStyle={{ width: 200, margin: 5 }}
              linearGradientProps={{
                colors: ["#ED213A", "#93291E"],
                start: [1, 0],
                end: [0.2, 0],
              }}
              title="Reset Card Stack"
              titleStyle={{ color: "white", fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light" }}
              chevron={{ color: "white" }}
              onPress={() => {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
                setIndex(0);
              }}
            />
            <ListItem
              Component={TouchableScale}
              friction={70} //
              tension={100} // These props are passed to the parent component (here TouchableScale)
              activeScale={0.65}
              containerStyle={{ width: 200, margin: 5 }}
              linearGradientProps={{
                colors: ["#8E2DE2", "#4A00E0"],
                start: [1, 0],
                end: [0.2, 0],
              }}
              title="Clear Grocery List"
              titleStyle={{ color: "white", fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light" }}
              chevron={{ color: "white" }}
              onPress={() => {
                Haptics.notificationAsync(
                  Haptics.NotificationFeedbackType.Success
                );
                Alert.alert(
                  "Warning",
                  "Are you sure you want to clear your list?",
                  [
                    {
                      text: "Nope",

                      style: "cancel",
                    },
                    {
                      text: "Yes",
                      onPress: () => {
                        selectedItems = [];
                        setListData([]);
                        tableRows = [];
                        console.log("Emptied List");
                      },
                    },
                  ],
                  { cancelable: false }
                );
              }}
            />
            <ListItem
              Component={TouchableScale}
              friction={70} //
              tension={100} // These props are passed to the parent component (here TouchableScale)
              activeScale={0.65}
              containerStyle={{ width: 200, margin: 5 }}
              linearGradientProps={{
                colors: ["#00B4DB", "#0083B0"],
                start: [1, 0],
                end: [0.2, 0],
              }}
              title="Barcode Scan"
              titleStyle={{ color: "white", fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light" }}
              chevron={{ color: "white" }}
              onPress={() => {
                setSettingsVisible(false)
                setCameraOn(true);
              }}
            />
          </View>
        </DialogContent>
      </Dialog>
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
        height={630}
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
                  fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light",
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
              <MaterialCommunityIcons.Button
                name={cardView ? "card-text-outline" : "view-list"}
                size={44}
                backgroundColor="transparent"
                underlayColor="transparent"
                activeOpacity={0.3}
                color={colors.red}
                style={{
                  marginLeft: 26,
                }}
                onPress={() => {
                  setCardView(!cardView);
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-evenly",
                margin: 10,
              }}
            >
              <MaterialCommunityIcons.Button
                name="file-pdf-box"
                size={44}
                backgroundColor="transparent"
                underlayColor="transparent"
                activeOpacity={0.3}
                color={"red"}
                onPress={() => {
                  createPDF(htmlString());
                }}
              />
              <MaterialCommunityIcons.Button
                name="message-text-outline"
                size={44}
                backgroundColor="transparent"
                underlayColor="transparent"
                activeOpacity={0.3}
                color={'red'}
                onPress={() => {
                  setSMSDialogVisible(true);
                }}
              />
              <MaterialCommunityIcons.Button
                name="whatsapp"
                size={44}
                backgroundColor="transparent"
                underlayColor="transparent"
                activeOpacity={0.3}
                color={"red"}
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
                color={"red"}
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
                    <Text style={{ margin: 10 }}>Include price:</Text>

                    <Switch
                      trackColor={{ false: colors.red, true: colors.green }}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => setpriceEnabled(!priceEnabled)}
                      value={priceEnabled}
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
                      text="Cancel"
                      onPress={() => {
                        setWhatsAppDialogVisible(false);
                      }}
                      style={{
                        backgroundColor: colors.red,
                        borderColor: colors.black,
                      }}
                      textStyle={{ color: colors.black }}
                    />
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
                    <Text style={{ margin: 10 }}>Include price:</Text>

                    <Switch
                      trackColor={{ false: colors.red, true: colors.green }}
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={() => setpriceEnabled(!priceEnabled)}
                      value={priceEnabled}
                    />
                  </View>
                </DialogContent>
              </Dialog>
              
            </View>
            <View style={{ height: 400 }}>
              {selectedItems.length === 0 ? (
                <View>
                <Text
                  style={{
                    fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light",
                    color: darkMode ? colors.white : colors.black,
                  }}
                >
                  Your list is empty. Add some products!
                  
                </Text>
                <AnimatedEllipsis numberOfDots={8}
                  animationDelay={150}
                  style={{
                    color: 'red',
                    fontSize: 30,
                  }}
/>
                </ View>
              ) : !cardView ? (
                <ScrollView bounces={true}>
                  <Table
                    borderStyle={{
                      borderWidth: 1,
                      borderColor: darkMode ? colors.red : "#cccccc",
                    }}
                    ref={tableRef}
                  >
                    <Row
                      data={productKeys}
                      style={{
                        height: 40,
                        backgroundColor: colors.red,
                      }}
                      textStyle={{
                        fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light",
                        fontWeight: "bold",
                        textAlign: "center",
                        margin: 9,
                        color: colors.white,
                      }}
                    />
                    {groceryList.map((rowData, index) => (
                      <TableWrapper
                        key={index}
                        style={{
                          flexDirection: "row",
                          backgroundColor: darkMode
                            ? colors.dark
                            : colors.white,
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
                              fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light",
                              textAlign: "center",
                              color: darkMode ? colors.white : colors.black,
                            }}
                          />
                        ))}
                      </TableWrapper>
                    ))}
                  </Table>
                </ScrollView>
              ) : (
                    <FlatList
                      data={selectedItems}
                      renderItem={({ item }) => {
                        return (
                          <ListItem
                            Component={TouchableScale}
                            friction={90} //
                            tension={100}
                            activeScale={0.95}
                            bottomDivider
                            containerStyle={{
                              width: 290,
                              height: 55,
                            }}
                            leftAvatar={{
                              rounded: true,
                              source: item.image && { uri: item.image },
                              height: 25,
                              width: 25,
                            }}
                            title={item.name + " (" + item.quantity + ")"}
                            titleStyle={{
                              color: darkMode ? colors.white : colors.black,
                              fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light",
                              fontSize: 16,
                            }}
                            chevron={{ color: "white" }}
                            rightContainerStyle={{ justifyContent: "center" }}
                            rightElement={
                              <Text style={{ color: colors.red, fontSize: 16 }}>
                                {item.price.toString()}
                              </Text>
                            }
                          />
                        );
                      }}
                      keyExtractor={(item) => item.id === undefined ? item.upc : item.id}
                    />
                  )}
            </View>
          </View>
          <View>
            <Text
              style={{
                color: darkMode ? colors.white : colors.black,
                textAlign: "center",
                marginTop: 10,
                fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light",
              }}
            >
              Total Estimated Cost: ${Math.round(calculateCost() * 100) / 100} +
              ${Math.round(calculateCost() * 0.13 * 100) / 100} HST
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
              style={{ backgroundColor: colors.red }}
              textStyle={{
                color: colors.black,
                fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light",
              }}
              text={"Cancel"}
              onPress={() => {
                setVisible(false);
                setQuantity(1);
              }}
            />
            <AddProductButton
              profileData={profileData}
              colors={colors}
              selectedItems={selectedItems}
              onQuickAdded={() => {
                onQuickAdded();
                swiperRef.current.swipeLeft();
              }}
              setListData={setListData}
              setQuantity={setQuantity}
              setFlavourQuantity={setFlavourQuantity}
              setProfileVisible={setVisible}
              tableRows={tableRows}
              quantity={quantity}
              swiperRef={swiperRef}
            />
          </DialogFooter>
        }
      >
        <DialogContent style={styles.popup}>
          <View style={{ marginTop: 20, marginBottom: 20 }}>
            <Profile
              profileData={data[index]}
              darkMode={darkMode}
              colors={colors}
              flavourQuantity={flavourQuantity}
              setFlavourQuantity={setFlavourQuantity}
              setQuantity={setQuantity}
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
          <View
            style={{
              flexDirection: "row",
              backgroundColor: darkMode ? "#333333" : colors.white,
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
                setSearchVisible(false);
                setSearch("");
              }}
            />
            <DialogTitle
              title="Quick-Add"
              textStyle={{ color: darkMode ? colors.white : colors.dark }}
              style={{
                backgroundColor: darkMode ? "#333333" : colors.white,
                textAlign: "center",
                justifyContent: "center",
                marginLeft: 45,
                borderBottomColor: "transparent",
              }}
            />
          </View>
        }
        dialogAnimation={
          new SlideAnimation({
            slideFrom: "bottom",
          })
        }
        height={580}
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
              height: 500,
            }}
          >
            <SearchBar
              placeholder="Search for a Product..."
              onChangeText={updateSearch}
              inputStyle={{ fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light" }}
              value={search}
              lightMode={!darkMode}
              containerStyle={{
                backgroundColor: darkMode ? colors.dark : colors.white,
                height: 66,
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
                setQuantity(1);
              }}
              footer={
                <DialogFooter>
                  <DialogButton
                    style={{ backgroundColor: colors.red }}
                    textStyle={{
                      color: colors.black,
                      fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light",
                    }}
                    text={"Cancel"}
                    onPress={() => {
                      setProfileVisible(false);
                      setQuantity(1);
                    }}
                  />
                  <AddProductButton
                    profileData={profileData}
                    colors={colors}
                    selectedItems={selectedItems}
                    onQuickAdded={onQuickAdded}
                    setListData={setListData}
                    setQuantity={setQuantity}
                    setFlavourQuantity={setFlavourQuantity}
                    setProfileVisible={setProfileVisible}
                    tableRows={tableRows}
                    quantity={quantity}
                  />
                </DialogFooter>
              }
              dialogStyle={{
                backgroundColor: darkMode ? colors.dark : colors.white,
              }}
            >
              <DialogContent style={styles.popup}>
                <Profile
                  profileData={profileData}
                  darkMode={darkMode}
                  colors={colors}
                  flavourQuantity={flavourQuantity}
                  setFlavourQuantity={setFlavourQuantity}
                  setQuantity={setQuantity}
                />
              </DialogContent>
            </Dialog>
            <FlatList
              bounces={true}
              keyExtractor={keyExtractor}
              data={filteredData}
              renderItem={renderItem}
            />
          </View>
        </DialogContent>
      </Dialog>
      <View style={styles.topContainer}></View>
      <View style={{ flexDirection: "row", justifyContent: "space-evenly" }}>

        <TouchableScale onPress={() => {
          setMovingBack(true);
          swiperRef.current.swipeBack();
          setIndex((index - 1) % data.length);
        }}>
          <MaterialCommunityIcons name="arrow-left-bold-circle-outline" size={34} color={colors.red} />
        </TouchableScale>
        <Text
          style={{
            textAlign: "center",
            fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light",
            fontSize: 26,
            color: darkMode ? colors.white : colors.red,
          }}
        >
          {index + 1}/{data.length}
        </Text>
        <TouchableScale onPress={() => {
          setMovingBack(false);
          swiperRef.current.swipeTop();
        }}>
          <MaterialCommunityIcons name="arrow-right-bold-circle-outline" size={34} color={colors.red} />
        </TouchableScale>
      </View>
      <View style={styles.swiperContainer}>

        <Swiper
          ref={swiperRef}
          cards={data}
          cardIndex={index}
          renderCard={(card) => <GroceryCard card={card} />}
          onSwiped={() => {
            setMovingBack(false);
            onSwiped();
          }}
          onSwipedRight={() => {
            setMovingBack(false);
            onSwipedRight();

          }}
          onTapCard={onTapCard}
          stackSize={2}
          stackScale={10}
          useViewOverflow={Platform.OS === 'ios'}
          stackSeparation={14}
          disableTopSwipe
          disableBottomSwipe
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeBackCard
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
          <TouchableOpacity onPress={() => swiperRef.current.swipeLeft()}>
            <Image
              source={require("./assets/remove.png")}
              style={{ height: 70, width: 70, marginRight: 20, marginTop: 10 }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => swiperRef.current.swipeRight()}>
            <Image
              source={require("./assets/add.png")}
              style={{
                height: 80,
                width: 80,
                marginLeft: 20,
                resizeMode: "contain",
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  swiperContainer: {
    flex: 0.6,
  },
  bottomContainer: {
    flex: 0.45,
    justifyContent: "space-evenly",
  },
  topContainer: {
    flex: 0.001,
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
    marginTop: -35
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
  text: { fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light", fontSize: 33 },
  heading: { fontSize: 24, marginBottom: 10, color: colors.gray },
  price: { color: colors.purple, fontSize: 32, fontWeight: "500" },

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
  quantityStyle: {
    fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light",
    textAlign: "center",
    fontWeight: "bold",
  },
  logoStyle: {
    width: 150,
    height: 30,
    resizeMode: "contain",
    marginTop: 15,
  },
});
