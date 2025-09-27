
import { Link, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";
import { Gradient } from "~/components/Gradient";
import { Button } from "~/components/ui/button";

export default function voiceScreen() {
const [start,setStart]=useState(false)

      const startConversation = async () => {
        setStart(true)
      };
      
      const endConversation = async () => {
  setStart(false)
      };
      
    return (
      <>
<Link style={{color:"white"}} href={'/voiceagent'}>settings</Link>
      </>
    )
}
