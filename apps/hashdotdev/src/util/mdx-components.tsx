import { Box, Typography, TypographyProps } from "@mui/material";
import dynamic from "next/dynamic";
import { ComponentType } from "react";

import { ImageWithText } from "../components/image-with-text";
import { Link, LinkProps } from "../components/link";
import { MdxImage } from "../components/mdx-image";
import { MdxPre } from "../components/mdx-pre";
import { MdxTalkSlide } from "../components/mdx-talk-slide";
import { MdxVideo } from "../components/mdx-video";

const CalculationBlock = dynamic<{}>(
  () =>
    import("../components/calculation-block").then(
      (module) => module.CalculationBlock,
    ),
  { ssr: false },
);

export const mdxComponents: Record<string, ComponentType<any>> = {
  Box,
  Typography,

  p: (props: TypographyProps<"p">) => {
    return <Typography {...props} variant="hashBodyCopy" />;
  },

  li: (props: TypographyProps<"li">) => {
    return (
      <li>
        <Typography {...props} variant="hashBodyCopy" />
      </li>
    );
  },

  a: (props: LinkProps) => <Link {...props} />,

  h1: (props: TypographyProps<"h1">) => (
    <Typography {...props} variant="hashHeading1" />
  ),

  h2: (props: TypographyProps<"h2">) => (
    <Typography {...props} variant="hashHeading2" />
  ),

  h3: (props: TypographyProps<"h3">) => (
    <Typography {...props} variant="hashHeading3" />
  ),

  h4: (props: TypographyProps<"h4">) => (
    <Typography {...props} variant="hashHeading4" />
  ),

  h5: (props: TypographyProps<"h5">) => (
    <Typography {...props} variant="hashHeading5" />
  ),

  CalculationBlock,

  pre: MdxPre,

  img: MdxImage,

  video: MdxVideo,

  ImageWithText,

  TalkSlide: MdxTalkSlide,
};