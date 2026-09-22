import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import spinner from "../../assets/gg.gif";
import "./avatar.css";
import { Button } from "react-bootstrap";
import { setAvatarAPI } from "../../utils/ApiRequest.js";

// import Buffer from "buffer";
const {
  uniqueNamesGenerator,
  colors,
  animals,
  countries,
  names,
  languages,
} = require("unique-names-generator");

const SetAvatar = () => {
  const sprites = [
    "adventurer",
    "micah",
    "avataaars",
    "bottts",
    "initials",
    "adventurer-neutral",
    "big-ears",
    "big-ears-neutral",
    "big-smile",
    "croodles",
    "identicon",
    "miniavs",
    "open-peeps",
    "personas",
    "pixel-art",
    "pixel-art-neutral",
    "identicon",
  ];

  const toastOptions = {
    position: "bottom-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };

  const navigate = useNavigate();

  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [selectedSprite, setSelectedSprite] = React.useState(sprites[0]);

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/login");
    }
  }, [navigate]);

  const randomName = () => {
    let shortName = uniqueNamesGenerator({
      dictionaries: [animals, colors, countries, names, languages], // colors can be omitted here as not used
      length: 2,
    });
    // console.log(shortName);

    return shortName;
  };

  const [imgURL, setImgURL] = React.useState([
    `https://api.dicebear.com/7.x/${sprites[0]}/svg?seed=${randomName()}`,
    `https://api.dicebear.com/7.x/${sprites[0]}/svg?seed=${randomName()}`,
    `https://api.dicebear.com/7.x/${sprites[0]}/svg?seed=${randomName()}`,
    `https://api.dicebear.com/7.x/${sprites[0]}/svg?seed=${randomName()}`,
  ]);

  const handleSpriteChange = (e) => {
    setSelectedSprite(() => {
      if (e.target.value.length > 0) {
        setLoading(true);
        const imgData = [];
        for (let i = 0; i < 4; i++) {
          imgData.push(
            `https://api.dicebear.com/7.x/${
              e.target.value
            }/svg?seed=${randomName()}`
          );
        }

        setImgURL(imgData);
        // console.log(imgData);
        setLoading(false);
      }

      return e.target.value;
    });
  };

   const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
    } else {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user?._id) {
          toast.error("Please login again", toastOptions);
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        const { data } = await axios.post(`${setAvatarAPI}/${user._id}`, {
          image: imgURL[selectedAvatar],
        });

        if (data.success && data.isSet) {
          localStorage.setItem("user", JSON.stringify(data.user));
          toast.success("Avatar selected successfully", toastOptions);
          navigate("/dashboard");
        } else {
          toast.error(data.message || "Error setting avatar, please try again", toastOptions);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Error setting avatar, please try again", toastOptions);
      } finally {
        setLoading(false);
      }
    }
  };


  return (
    <>
      <div style={{ position: "relative", overflow: "hidden", minHeight: '100vh', background: '#f4f6f8' }}>

        {loading === true ? (
          <>
            {/* <Container></Container> */}
            <div
              className="container containerBox"
              h={"100vh"}
              style={{ position: "relative", zIndex: "2 !important" }}
            >
              <div className="avatarBox">
                <image src={spinner} alt="Loading"></image>
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              className="container containerBox"
              style={{ position: "relative", zIndex: "2 !important" }}
            >
              <div className="avatarBox">
                <h1 className="text-center mt-5" style={{ color: "#111827", fontWeight: 800 }}>
                  Choose Your Avatar
                </h1>
                {/* <div className="imgBox">
                        
                        {imgURL.map((image, index)=> {

                            console.log(image);
                            return(
                                <img key={index} src={image} alt="" className={`avatar ${selectedAvatar === index ? "selected" : ""} img-circle imgAvatar`} onClick={() => setSelectedAvatar(index)} width="250px" height="250px"/>
                            )
                        })}
                            
                        

                    </div> */}
                <div className="container">
                  <div className="row">
                    {imgURL.map((image, index) => {
                      console.log(image);
                      return (
                        <div key={index} className="col-lg-3 col-md-6 col-6">
                          <img
                            src={image}
                            alt=""
                            className={`avatar ${
                              selectedAvatar === index ? "selected" : ""
                            } img-circle imgAvatar mt-5`}
                            onClick={() => setSelectedAvatar(index)}
                            width="100%"
                            height="auto"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <select
                  onChange={handleSpriteChange}
                  value={selectedSprite}
                  className="form-select mt-5"
                >
                  {sprites.map((sprite, index) => (
                    <option value={sprite} key={index}>
                      {sprite}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={setProfilePicture}
                  type="submit"
                  className="mt-5"
                >
                  Set as Profile Picture
                </Button>
              </div>

              <ToastContainer />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SetAvatar;
