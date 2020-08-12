import { StatusBar } from "expo-status-bar";
import React, { useEffect, Component } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import NumericInput from "react-native-numeric-input";
import { SearchBar, ListItem, Card } from "react-native-elements";
import TouchableScale from "react-native-touchable-scale";

const Profile = ({
  profileData,
  darkMode,
  colors,
  flavourQuantity,
  setQuantity,
  setFlavourQuantity,
}) => {
  return (
    <Card
      title={profileData.name}
      titleStyle={{
        color: darkMode ? colors.white : colors.black,
      }}
      image={{ uri: profileData.image }}
      imageStyle={{ height: 300, width: 300 }}
      containerStyle={{
        backgroundColor: darkMode ? colors.dark : colors.white,
        borderColor: darkMode ? colors.red : "transparent",
      }}
    >
      <Text
        style={{
          fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Light",
          marginBottom: 10,
          color: darkMode ? colors.white : colors.black,
          textAlign: "center",
        }}
      >
        {profileData.name} {profileData.name.endsWith("s") ? "are" : "is"} in
        the {profileData.category} category and cost
        {profileData.name.endsWith("s") ? "" : "s"} ${profileData.price.toString()} per
        unit. Found at {profileData.store}
        {profileData.options == null
          ? "."
          : " with " + profileData.options.flavours.length + " flavours."}
      </Text>
      <View style={{ height: 60 }}>
        {profileData.options === undefined ? (
          <View style={{ alignItems: "center" }}>
            <NumericInput
              onChange={(value) => {
                profileData.quantity = value;
                setQuantity(value);
              }}
              totalWidth={200}
              totalHeight={60}
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
          </View>
        ) : (
            <FlatList
              data={profileData.options.flavours}
              renderItem={({ item }) => {
                return (
                  <ListItem
                    Component={TouchableScale}
                    friction={90} //
                    tension={100}
                    activeScale={0.95} //
                    linearGradientProps={{
                      colors: [colors.red, "#b31217"],
                      start: [1, 0],
                      end: [0.2, 0],
                    }}
                    containerStyle={{ width: 290, height: 45 }}
                    leftAvatar={{
                      rounded: true,
                      source: { uri: item.image },
                      height: 25,
                      width: 25,
                    }}
                    title={item.name}
                    titleStyle={{
                      color: "white",
                      fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir-Medium",
                      fontSize: 15,
                    }}
                    chevron={{ color: "white" }}
                    rightElement={
                      <NumericInput
                        onChange={(value) => {
                          item.quantity = value;
                        }}
                        value={flavourQuantity}
                        totalWidth={90}
                        totalHeight={30}
                        iconSize={25}
                        step={1}
                        valueType="real"
                        rounded
                        textColor={darkMode ? colors.white : "#000"}
                        iconStyle={{
                          color: darkMode ? colors.dark : colors.white,
                        }}
                        rightButtonBackgroundColor={colors.red}
                        leftButtonBackgroundColor={colors.redLeft}
                        containerStyle={{
                          backgroundColor: darkMode ? "#404040" : colors.white,
                        }}
                        maxValue={10}
                        minValue={1}
                        initValue={0}
                        borderColor={darkMode ? "#404040" : colors.white}
                      />
                    }
                  />
                );
              }}
              keyExtractor={(item) => item.id}
            />
          )}
      </View>
    </Card>
  );
};

export default Profile;
