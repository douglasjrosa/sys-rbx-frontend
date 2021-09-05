import Navbar from "./elements/navbar";
import Footer from "./elements/footer";
import { useState } from "react";

const Layout = ({ children, global }) => {
  const { navbar, footer } = global;

  return (
    <div className="">
      {/* Aligned to the top */}
      <div className="">
        <div className="">
          <Navbar navbar={navbar} />
        </div>
        <div className="">{children}</div>
      </div>
      {/* Aligned to the bottom */}
      <Footer footer={footer} />
    </div>
  );
};

export default Layout;
