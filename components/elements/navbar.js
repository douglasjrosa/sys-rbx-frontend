import { useState } from "react";
import Link from "next/link";
import PropTypes from "prop-types";
import { MdMenu } from "react-icons/md";
import MobileNavMenu from "./mobile-nav-menu";
import ButtonLink from "./button-link";
import Image from "./image";
import {
  mediaPropTypes,
  linkPropTypes,
  buttonLinkPropTypes,
} from "utils/types";
import { getButtonAppearance } from "utils/button";
import CustomLink from "./custom-link";
import { signIn, signOut, useSession } from "next-auth/client"



const Navbar = ({ navbar }) => {
  const [mobileMenuIsShown, setMobileMenuIsShown] = useState(false);
  const [session, loading] = useSession();

  return (
    <>
      {/* The actual navbar */}
      <nav classname="">
        <div classname="">
          {/* Content aligned to the left */}
          <div classname="">
            <Link href="/[[...slug]]" as="/">
              <a aria-label="Página inicial">
                <Image
                  media={navbar.logo}
                  classname=""
                  alt="Logomarca Ribermax"
                />
              </a>
            </Link>
            {/* List of links on desktop */}
            <ul classname="">
              {navbar.links.map((navLink) => (
                <li key={navLink.id}>
                  <CustomLink link={navLink}>
                    <div classname="">
                      {navLink.text}
                    </div>
                  </CustomLink>
                </li>
              ))}
            </ul>
          </div>
          {!session && (
            <>
              Not signed in <br />
              <button onClick={() => signIn()}>Sign in</button>
            </>
          )}
          {session && (
            <>
              Signed in as {session.user.email} <br />
              <button onClick={() => signOut()}>Sign out</button>
            </>
          )}

          {/* Hamburger menu on mobile */}
          <button
            onClick={() => setMobileMenuIsShown(true)}
            classname=""
            aria-label="Menu principal"
          >
            <MdMenu classname="" />
          </button>
          {/* CTA button on desktop */}
          {navbar.button && (
            <div classname="">
              <ButtonLink
                button={navbar.button}
                appearance={getButtonAppearance(navbar.button.type, "light")}
                compact
                aria-label="Menu principal"
              />
            </div>
          )}
        </div>
      </nav>

      {/* Mobile navigation menu panel */}
      {mobileMenuIsShown && (
        <MobileNavMenu
          navbar={navbar}
          closeSelf={() => setMobileMenuIsShown(false)}
          aria-label="Fechar menu principal"
        />
      )}
    </>
  );
};

Navbar.propTypes = {
  navbar: PropTypes.shape({
    logo: mediaPropTypes,
    links: PropTypes.arrayOf(linkPropTypes),
    button: buttonLinkPropTypes,
  }),
};

export default Navbar;
