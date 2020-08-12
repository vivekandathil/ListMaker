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
import TouchableScale from "react-native-touchable-scale";

import * as SMS from 'expo-sms';

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

function MessageDialog(props) {

    //const [visible, setVisible] = React.useState(props.visible);
    const [priceEnabled, setpriceEnabled] = React.useState(false);
    const [to, setTo] = React.useState('');
    const isAvailable = true;

    React.useEffect(async () => {
        isAvailable = await SMS.isAvailableAsync();
    }, [])


    return (
        <Dialog
            visible={props.visible}
            width={300}
            onTouchOutside={() => {
                props.setVisible(false);
            }}
            dialogTitle={<DialogTitle title="Send an SMS message" />}
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
                            props.setVisible(false);
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

                            if (isAvailable) {
                                SMS.sendSMSAsync(to, props.generateSMS())
                            } else {
                                alert("Error: SMS unavailable")
                            }
                        }}
                        style={{ backgroundColor: colors.green }}
                        textStyle={{ color: colors.black }}
                    />
                </DialogFooter>
            }
        >
            <DialogContent style={props.styles.popup}>
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
                            setTo(text);
                        }}
                        value={to}
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
    )
}

export default MessageDialog;