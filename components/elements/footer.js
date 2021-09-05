import Image from "./image";
import PropTypes from "prop-types";
import { linkPropTypes, mediaPropTypes } from "utils/types";
import CustomLink from "./custom-link";

const Footer = ({ footer }) => {
  return (
    <footer classname="">
      <div classname="">
        <div>
          {footer.logo && (
            <Image media={footer.logo} classname="" />
          )}
        </div>
        <nav classname="">
          {footer.columns.map((footerColumn) => (
            <div
              key={footerColumn.id}
              classname=""
            >
              <p classname="">
                {footerColumn.title}
              </p>
              <ul classname="">
                {footerColumn.links.map((link) => (
                  <li key={link.id} classname="">
                    <CustomLink link={link}>
                      {link.text}
                    </CustomLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div classname="">
        <div classname="">{footer.smallText}</div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  footer: PropTypes.shape({
    logo: mediaPropTypes.isRequired,
    columns: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        title: PropTypes.string.isRequired,
        links: PropTypes.arrayOf(linkPropTypes),
      })
    ),
    smallText: PropTypes.string.isRequired,
  }),
};

export default Footer;
