import * as React from "react";
import { Ellipsis } from "~/lib/icons/Ellipsis";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Text } from "~/components/ui/text";
import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/lib/constants";

export default function DialogMenu({ handleDelete, handleEdit, handleShare, handleSetNotification, handleUnsetNotification, notifiactionId }: { handleDelete: () => void; handleEdit?: () => void; handleShare?: () => void; handleSetNotification?: () => void; handleUnsetNotification?: () => void; notifiactionId?: string | null }) {
  const { isDarkColorScheme } = useColorScheme();
  const theme = NAV_THEME[isDarkColorScheme ? "dark" : "light"];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={"icon"} variant={"ghost"}>
          <Ellipsis className="text-foreground" size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent style={{

        shadowColor: theme.text,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }} align="center" side="top" className="native:w-72 w-64">
        <DropdownMenuLabel>Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {handleEdit && (
            <DropdownMenuItem onPress={handleEdit}>
              <Text>Edit</Text>
            </DropdownMenuItem>
          )}
          {handleShare && (
            <DropdownMenuItem onPress={handleShare}>
              <Text>Share</Text>
            </DropdownMenuItem>
          )}
          {(handleSetNotification && !notifiactionId) && (
            <DropdownMenuItem onPress={handleSetNotification}>
              <Text>Set Notification</Text>
            </DropdownMenuItem>
          )}
          {(handleUnsetNotification && notifiactionId) && (
            <DropdownMenuItem onPress={handleUnsetNotification}>
              <Text>Unset Notification</Text>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuItem className="bg-destructive/5" onPress={handleDelete}>
          <Text className="text-destructive" >Delete</Text>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
