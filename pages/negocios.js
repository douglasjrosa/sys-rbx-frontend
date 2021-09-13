import Produtos from "./produtos";

import { useRef } from "react";
import dynamic from "next/dynamic";
const GeneratePDF = dynamic(() => import("../utils/pdf-helper"), {ssr: false});

const Negocios = () => {
  const ref = useRef();

  return (
    <div>
      <GeneratePDF html={ref} w="30px" m="20px" />
      <div ref={ref}>
        <Produtos />
      </div>
    </div>
  );
};

export default Negocios;
