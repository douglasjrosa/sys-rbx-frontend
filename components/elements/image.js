import { getStrapiMedia } from "utils/media";
import PropTypes from "prop-types";
import { mediaPropTypes } from "utils/types";
import { Image } from "@chakra-ui/react"

const StrapiImage = ({ media, ...props }) => {
  const { url, alternativeText } = media;
  const fullUrl = getStrapiMedia(url);

  return (
    <Image
      {...props}
      src={fullUrl}
      alt={alternativeText || ""}
    />
  );
};

Image.propTypes = {
  media: mediaPropTypes.isRequired,
  className: PropTypes.string,
};

export default StrapiImage;
