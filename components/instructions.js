import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Image,
    ImagePropTypes,
} from "react-native";
import Dialog, {
    DialogContent,
    DialogTitle,
    SlideAnimation,
    DialogFooter,
    DialogButton,
} from "react-native-popup-dialog";

import { LinearGradient } from 'expo-linear-gradient';
import TouchableScale from "react-native-touchable-scale";

import { MaterialCommunityIcons, Fontisto } from "@expo/vector-icons";

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

function InstructionPopup(props) {

    const [visible, setVisible] = React.useState(true);

    return (
        <Dialog
            visible={visible}
            onTouchOutside={() => {
                setVisible(false);
            }}
            dialogAnimation={
                new SlideAnimation({
                    slideFrom: "bottom",
                })
            }
            width={Dimensions.get('window').width * 0.95}
        >
            <DialogContent>
                <View style={{
                    marginBottom: 20,
                    borderColor: colors.red,
                    borderBottomWidth: 1,
                }}>
                    <Text style={{ fontWeight: 'normal', fontSize: 30, textAlign: "center", fontFamily: 'Avenir-Light', color: "#b30000", marginTop: 14 }}>Welcome to</Text>
                    <Image
                        source={require("../assets/logo_small.png")}
                        style={{
                            width: 168,
                            height: 50,
                            marginBottom: 14,
                            resizeMode: "contain",
                            alignSelf: 'center'
                        }}
                    />
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', marginBottom: 10 }}>
                    <MaterialCommunityIcons
                        name="cards-outline"
                        size={24}
                        backgroundColor="transparent"
                        underlayColor="transparent"
                        activeOpacity={0.3}
                        color={colors.red}
                    />
                    <Text style={{ fontWeight: 'bold', fontFamily: 'Avenir-Light', fontSize: 19, textAlign: 'center', marginLeft: 10 }}>Swiping</Text>
                </View>
                <Text style={{ fontSize: 16, fontFamily: 'Avenir-Light' }}>Each card represents a grocery product. Swipe a card to the right if you wish to add it to your grocery list. Otherwise, swipe it left.</Text>

                <View style={{ display: 'flex', flexDirection: 'row', marginTop: 10, marginBottom: 10 }}>
                    <MaterialCommunityIcons
                        name="magnify"
                        size={24}
                        backgroundColor="transparent"
                        underlayColor="transparent"
                        activeOpacity={0.3}
                        color={colors.red}
                    />
                    <Text style={{ fontWeight: 'bold', fontFamily: 'Avenir-Light', fontSize: 19, textAlign: 'center', marginLeft: 10 }}>Scroll View</Text>
                </View>
                <Text style={{ fontSize: 16, fontFamily: 'Avenir-Light' }}>Click the icon in the top-left to scroll through all the products and quickly add them to your list.</Text>
                <View style={{ display: 'flex', flexDirection: 'row', marginBottom: 10, marginTop: 10 }}>
                    <MaterialCommunityIcons
                        name="format-list-checkbox"
                        size={24}
                        backgroundColor="transparent"
                        underlayColor="transparent"
                        activeOpacity={0.3}
                        color={colors.red}
                    />
                    <Text style={{ fontWeight: 'bold', fontFamily: 'Avenir-Light', fontSize: 19, textAlign: 'center', marginLeft: 10 }}>View List {"\&"} Export</Text>
                </View>
                <Text style={{ fontSize: 16, fontFamily: 'Avenir-Light' }}>Once you're finished adding items, select the icon in the top right to review/export your list.</Text>



                <Text style={{ fontFamily: 'Avenir-Light', fontSize: 18, textAlign: 'center', color: 'green', marginTop: 20 }}>{props.data === undefined ? "JSON failed to load. Check your S3 bucket" : "✅  JSON loaded successfully! (" + props.data.length + " items)"}</Text>

                <TouchableScale onPress={() => {
                    setVisible(false);
                }}>
                    <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: 5, borderWidth: 4, borderRadius: 6, borderColor: "#990000", marginTop: 20 }}>
                        <LinearGradient
                            // Background Linear Gradient
                            colors={['#b30000', '#F00000']}
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: 0,
                                height: 31
                            }}
                        />
                        <Text style={{ fontSize: 18, fontFamily: "Avenir-Light", color: "white", fontWeight: 'bold', marginBottom: 2 }}>Get Started</Text>
                    </View>
                </TouchableScale>
            </DialogContent>
        </Dialog >
    );
}

export default InstructionPopup;