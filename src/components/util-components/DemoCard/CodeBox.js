import React, { useState } from "react";
import PropTypes from "prop-types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import syntaxTheme from "./HLTheme";
import CardToolBar from "./CardToolbar";

const CodeBox = ({ value, language = "" }) => {
  const [codeExpand, setCodeExpand] = useState(false);

  const expandCallBack = () => {
    setCodeExpand((prev) => !prev);
  };

  return (
    <>
      <CardToolBar code={value} expand={expandCallBack} isExpand={codeExpand} />
      <div className={`code-box-highlight ${codeExpand ? "d-block" : "d-none"}`}>
        <SyntaxHighlighter language={language} style={syntaxTheme}>
          {value}
        </SyntaxHighlighter>
      </div>
    </>
  );
};

CodeBox.propTypes = {
  value: PropTypes.string.isRequired,
  language: PropTypes.string,
};

export default CodeBox;
