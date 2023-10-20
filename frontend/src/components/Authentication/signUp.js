import React , {useState} from 'react';
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import {
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/input";
import { Button } from "@chakra-ui/button";
import { VStack } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useHistory } from "react-router-dom";

const signUp = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [confirmpassword, setConfirmpassword] = useState();
  const [pic, setPic] = useState();
  const [loading, setLoading] = useState(false);

  const toast = useToast(); // to show pop-ups
  const history = useHistory();

  const handleClick = () => setShow(!show);

  // for uploading pic
    const postDetails = (pics) => {
      setLoading(true);
      if (pics === undefined) {
        toast({
          title: "Please select an Image!",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        return;
      }

      // check pics type
      if (pics.type === "image/png" || pics.type === "image/jpeg" || pics.type === "image/jpg") {
        const data = new FormData();
        data.append("file", pics);
        data.append("upload_preset", "Chatopia");
        data.append("cloud_name", "dciwzu2ae"); // from cloudinary
        fetch("https://api.cloudinary.com/v1_1/dciwzu2ae/image/upload", {
          method: "post",
          body: data,
        })
          .then((res) => res.json())
          .then((data) => {
            setPic(data.url.toString());
            setLoading(false);
          })
          .catch((err) => {
            console.log(err);
            setLoading(false);
          });
      } else {
        toast({
          title: "Please select an Image!",
          status: "warning",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        setLoading(false);
        return;
      }
    };

   const submitHandler = async () => {
     setLoading(true);
     if (!name || !email || !password || !confirmpassword) {
       toast({
         title: "Please fill all the feilds",
         status: "warning",
         duration: 5000,
         isClosable: true,
         position: "bottom",
       });
       setLoading(false);
       return;
     }
     if (password !== confirmpassword) {
       toast({
         title: "passwords donot match",
         status: "warning",
         duration: 5000,
         isClosable: true,
         position: "bottom",
       });
       return;
     }

     try {
       const config = {
         Headers: {
           "Content-type": "application/json",
         },
       };

       const { data } = await axios.post(
         "/api/user",
         { name, email, password, pic },
         config
       );
       toast({
         title: "Register Successful",
         status: "success",
         duration: 5000,
         isClosable: true,
         position: "bottom",
       });

       // store in local storage
       localStorage.setItem("userInfo", JSON.stringify(data));
       setLoading(false);
       history.push("/chats");
     } catch (error) {
       toast({
         title: "Error Occurred!",
         description: error.response.data.message,
         status: "error",
         duration: 5000,
         isClosable: true,
         position: "bottom",
       });
       setLoading(false);
     }
   };

  return (
    <VStack spacing={"5px"}>
      {/* Name */}
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter Your name"
          onChange={(e) => setName(e.target.value)}
        ></Input>
      </FormControl>

      {/* Email */}
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type='email'
          placeholder="Enter Your Email"
          onChange={(e) => setEmail(e.target.value)}
        ></Input>
      </FormControl>

      {/* Password */}
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          ></Input>
          <InputRightElement width={"4.5rem"}>
            <Button height={"1.75rem"} size={"sm"} onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      {/* Confirm Password */}
      <FormControl id="confirm-password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmpassword(e.target.value)}
          ></Input>
          <InputRightElement width={"4.5rem"}>
            <Button height={"1.75rem"} size={"sm"} onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      {/* pic */}
      <FormControl id="pic" isRequired>
        <FormLabel>Upload Your Picture</FormLabel>
        <Input
          type="file"
          p={"1.5"}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        ></Input>
      </FormControl>

      {/* Button */}
      <Button
        colorScheme={"blue"}
        width={"100%"}
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Sign Up
        </Button>
      </VStack>
  );
}

export default signUp;
