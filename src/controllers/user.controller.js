import asyncHandler from "../utils/asyncHandler.js";
import APIErrors from "../utils/APIErrors.js";
import APIResponse from "../utils/APIResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await user.genrateAccessToken();
    const refreshToken = await user.genrateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch {
    throw new APIErrors(500, "something went wring while creating Tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //steps to understand the logic of registerUser
  //get user deatails from frontEnd
  //validation - not empty deatails
  //check if user is allready
  //check for images and check for avatar
  //the upload them to cloudinary
  //craete User object and create entry in db
  //remove password and refreshToken field from response
  //check for user creation
  //return final response

  //step-1
  const { fullname, username, password, email } = req.body;

  //step-2
  if (
    [fullname, username, password, email].some((field) => field?.trim() === "")
  ) {
    throw new APIErrors(StatusCodes.NOT_ACCEPTABLE, "All fields are required");
  }

  //step-3
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new APIErrors(
      StatusCodes.CONFLICT,
      "User with this email or username already existed"
    );
  }

  //console.log(req.files);

  //step-4
  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverImageLocalPath = req.files.coverimage[0].path;
  }

  if (!avatarLocalPath) {
    throw new APIErrors(StatusCodes.BAD_REQUEST, "Avatar file required");
  }

  //step-5
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverimage = await uploadOnCloudinary(coverImageLocalPath);

  //step-6
  const user = await User.create({
    fullname,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverimage: coverimage?.url || "",
  });

  //step-7
  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //step-8
  if (!userCreated) {
    throw new APIErrors(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Something went wrong while registering the user"
    );
  }

  //step-9
  return res
    .status(StatusCodes.CREATED)
    .json(
      new APIResponse(StatusCodes.OK, userCreated, "User Registed Successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  //getting data from body;
  //username or email
  // finding user in db
  // matching passss
  //access and refresh token
  //send cookie

  //step-1;
  const { username, password, email } = req.body;

  if (!username && !email) {
    throw new APIErrors(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new APIErrors(404, "user does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new APIErrors(401, "Invalid credentials!");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new APIResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findOneAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  const option = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new APIResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new APIErrors(401, "unauthorized request");
  }

  try {
    const decodedDataFromToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET_KEY
    );

    const user = await User.findById(decodedDataFromToken?._id);

    if (!user) {
      throw new APIErrors(401, "Invalid Refresh Token");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new APIErrors(401, "RefreshToken is expired or used");
    }

    const option = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } = generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", newRefreshToken, option)
      .json(
        new APIResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "AccessToken Refreshed"
        )
      );
  } catch (error) {
    throw new APIErrors(401, error?.message || "Invalid refreshToken");
  }
});
export { registerUser, loginUser, logoutUser, refreshAccessToken };
