import PropTypes from "prop-types";
import { MdClose, MdChevronRight } from "react-icons/md";
import Image from "./image";
import {
  mediaPropTypes,
  linkPropTypes,
  buttonLinkPropTypes,
} from "utils/types";
import ButtonLink from "./button-link";
import { useLockBodyScroll } from "utils/hooks";
import { getButtonAppearance } from "utils/button";
import CustomLink from "./custom-link";

const MobileNavMenu = ({ navbar, closeSelf }) => {
  // Prevent window scroll while mobile nav menu is open
  useLockBodyScroll();

  return (
    <div classname="">
      <div classname="">
        {/* Top section */}
        <div classname="">
          {/* Company logo */}
          <Image media={navbar.logo} classname="" />
          {/* Close button */}
          <button onClick={closeSelf} classname="">
            <MdClose classname="" />
          </button>
        </div>
        {/* Bottom section */}
        <div classname="">
          <ul classname="">
            {navbar.links.map((navLink) => (
              <li key={navLink.id} classname="">
                <CustomLink link={navLink}>
                  <div classname="">
                    <span>{navLink.text}</span>
                    <MdChevronRight classname="" />
                  </div>
                </CustomLink>
              </li>
            ))}
          </ul>
          <ButtonLink
            button={navbar.button}
            appearance={getButtonAppearance(navbar.button.type, "light")}
          />
        </div>
      </div>
    </div>
  );
};

MobileNavMenu.propTypes = {
  navbar: PropTypes.shape({
    logo: mediaPropTypes,
    links: PropTypes.arrayOf(linkPropTypes),
    button: buttonLinkPropTypes,
  }),
  closeSelf: PropTypes.func,
};

export default MobileNavMenu;
