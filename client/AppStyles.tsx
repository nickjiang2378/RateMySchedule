import React from "react";
import { StyleSheet } from "react-native";

export const COLOR_PRIMARY = "#0984e3";
export const COLOR_ACCENT = "#dfe6e9";
export const COLOR_LIGHT = "#dfe6e9";
export const COLOR_DARK = "#2d3436";
export const COLOR_GREY = "#C2C8CB"
export const COLOR_BACKGROUND = "#ffffff";

export const AppStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLOR_BACKGROUND,
  },
  description_container: {
    flex: 1,
    justifyContent: "space-evenly"
  },
  card_container: {

    flexDirection: "row",
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.10,
    shadowRadius: 3.84,
    elevation: 3,
  },
  filler_page: {
    textAlign: "center",
    margin: 20,
    color: COLOR_DARK
  },
  text_input: {
    backgroundColor: "white",
    marginBottom: 20
  },
  button: {
    marginBottom: 20
  },
  faded_button: {
    color: COLOR_GREY
  },
  h1: {
    fontSize: 32,
  },
  h2: {
    fontSize: 24,
  },
  h3: {
    fontSize: 20,
  },
  body: {
    fontSize: 14,
  },
});
