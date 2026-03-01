import { Image } from "react-native";

// Image imports for the application
import avatarPlaceHolder from "../../assets/images/avatar-placeholder.jpg";
import ampcmLogo from "../../assets/images/mycoop-logo.png";
import noImage from "../../assets/images/no-image.png";

import ampcmGreenFullLogo from "../../assets/images/green-full-logo.png";
import ampcmGreenLogo from "../../assets/images/green-logo.png";
import ampcmWhiteFullLogo from "../../assets/images/white-full-logo.png";
import ampcmWhiteLogo from "../../assets/images/white-logo.png";

// Actor Categories
import actorOrganizations from "../../assets/images/coop-3.png";
import farmerCategoryImage from "../../assets/images/farmer-2.png";

import mozMapPattern from "../../assets/images/moz-map-pattern.jpg";

// organization categories
import associationCategoryImage from "../../assets/images/association-20.png";
import cooperativeCategoryImage from "../../assets/images/coop-20.png";
import farmerGroupCategoryImage from "../../assets/images/group-20.png";
import sprayerCategoryImage from "../../assets/images/sprayer.png";
import unionCategoryImage from "../../assets/images/union-20.png";

export const avatarPlaceholderUri =
  Image.resolveAssetSource(avatarPlaceHolder).uri;
export const ampcmLogoUri = Image.resolveAssetSource(ampcmLogo).uri;
export const ampcmGreenLogoUri = Image.resolveAssetSource(ampcmGreenLogo).uri;
export const ampcmWhiteLogoUri = Image.resolveAssetSource(ampcmWhiteLogo).uri;
export const ampcmGreenFullLogoUri =
  Image.resolveAssetSource(ampcmGreenFullLogo).uri;
export const ampcmWhiteFullLogoUri =
  Image.resolveAssetSource(ampcmWhiteFullLogo).uri;
export const appIconUri = Image.resolveAssetSource(ampcmGreenLogo).uri;

export const noImageUri = Image.resolveAssetSource(noImage).uri;
export const mozMapPatternUri = Image.resolveAssetSource(mozMapPattern).uri;

// Actor Categories
export const farmerCategoryImageUri =
  Image.resolveAssetSource(farmerCategoryImage).uri;
export const actorOrganizationsImageUri =
  Image.resolveAssetSource(actorOrganizations).uri;
export const sprayerCategoryImageUri =
  Image.resolveAssetSource(sprayerCategoryImage).uri;

// organization categories
export const associationCategoryImageUri = Image.resolveAssetSource(
  associationCategoryImage,
).uri;
export const cooperativeCategoryImageUri = Image.resolveAssetSource(
  cooperativeCategoryImage,
).uri;
export const farmerGroupCategoryImageUri = Image.resolveAssetSource(
  farmerGroupCategoryImage,
).uri;
export const unionCategoryImageUri =
  Image.resolveAssetSource(unionCategoryImage).uri;
