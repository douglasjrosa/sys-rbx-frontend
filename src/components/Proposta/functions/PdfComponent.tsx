import React from "react";

const PdfComponent = (props: { html: string }) => {
  return <div dangerouslySetInnerHTML={{ __html: props.html }} />;
};

export default PdfComponent;
