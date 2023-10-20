import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { Text } from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Avatar } from "@chakra-ui/react";
import { ChatState } from "../../Context/ChatProvider";
import ProfileModel from "./ProfileModel";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useDisclosure } from "@chakra-ui/hooks";
import ChatLoading from "../ChatLoading";
import UserListItem from "../UserAvatar/UserListItem";
import axios from "axios";
import { getSender } from "../../config/ChatLogics";
import NotificationBadge from "react-notification-badge";
import { Effect } from "react-notification-badge";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
  const history = useHistory();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  }

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
        setLoading(true)

        const config = {
            headers:{
                Authorization: `Bearer ${user.token}`,
            },
        };

        const {data} = await axios.get(`/api/user?search=${search}`,config);

        setLoading(false);
        setSearchResult(data);
    } catch (error) {
       toast({
            title:" Error Occured!",
            description: "Failed to load the search results",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
       });
    }
};

const accessChat = async (userId)=>{
    try {
        setLoading(true);
        const config = {
            headers:{
                "Content-type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
        };

        const {data} = await axios.post(`/api/chat`,{userId},config);

        if(!chats.find((c) => c._id === data._id)) setChats([data,...chats]);

        setSelectedChat(data);
        setLoadingChat(false);
        onClose();
    } catch (error) {
        toast({
          title: " Error fetching the chat!",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
    }
};

  return (
    <>
      {/* contains the navbar of chatpage */}
      <Box
        display={"flex"}
        justifyContent={"space-between"}
        alignItems={"center"}
        bg={"white"}
        w={"100%"}
        p={"5px 10px 5px 10px"}
        borderWidth={"5px"}
      >
        <Tooltip label="Search users to chat" hasArrow placement="bottom-end">
          <Button variant={"ghost"} onClick={onOpen}>
            <i className="fas fa-search"></i>
            {/* don't display in smaller screens */}
            <Text display={{ base: "none", md: "flex" }} px={"4"}>
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize={"3xl"} fontFamily={"Work sans"} fontWeight={"bold"} color={"blue"}>
          Talk-A-Tive
        </Text>

        <div>
          <Menu>
            <MenuButton p={"1"}>
              <NotificationBadge
                count = {notification.length}
                effect = {Effect.SCALE}
              ></NotificationBadge>
              <BellIcon fontSize={"2xl"} m={"1"}></BellIcon>
            </MenuButton>
            <MenuList pl={"2"}>
              {/* render notifications */}
              {!notification.length && "No New Messages"}
              {notification.map((notif) =>  {
                  return (<MenuItem
                    key={notif._id}
                    onClick={() => {
                      setSelectedChat(notif.chat);
                      setNotification(notification.filter((n) => n !== notif));
                    }}
                  >
                    {notif.chat.isGroupChat
                      ? `New Message in ${notif.chat.chatName}`
                      : `New Message from ${notif.sender.name}`}
                         {/* `New Message from ${getSender(user, notif.chat.users)}`} */}
                  </MenuItem>)
})}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon></ChevronDownIcon>}
            >
              {/* import avatar from chackraui for round profile-pic*/}
              <Avatar
                size={"sm"}
                cursor={"pointer"}
                name={user.name}
                src={user.pic}
              ></Avatar>
            </MenuButton>
            <MenuList>
              <ProfileModel user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModel>
              <MenuDivider></MenuDivider> {/* for space between them */}
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      {/* create sideDrawer */}
      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay></DrawerOverlay>
        <DrawerContent>
          <DrawerHeader borderBottomWidth={"1px"}>Search Users</DrawerHeader>
          <DrawerBody>
            {/* for input */}
            <Box display={"flex"} pb={"2"}>
              <Input
                placeholder="Search by name or email"
                mr={"2"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              ></Input>
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading></ChatLoading>
            ) : (
              // rendering chats
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                ></UserListItem>
              ))
            )}
            {loadingChat && <Spinner ml={"auto"} display={"flex"}></Spinner>}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
