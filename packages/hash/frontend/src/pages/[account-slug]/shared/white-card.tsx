import {
  Card,
  CardActionArea,
  cardActionAreaClasses,
  CardActionAreaProps,
  CardContent,
  CardContentProps,
} from "@mui/material";

export const WhiteCard = ({
  onClick,
  href,
  children,
}: {
  onClick?: CardActionAreaProps["onClick"];
  href?: string;
  children: CardContentProps["children"];
}) => {
  const cardContent = (
    <CardContent
      sx={{
        p: "0 !important",
        background: "white",
      }}
    >
      {children}
    </CardContent>
  );

  return (
    <Card
      sx={[
        (theme) => ({
          boxShadow: theme.boxShadows.xs,
          overflow: "visible",
        }),
        onClick
          ? (theme) => ({
              "&:hover": {
                boxShadow: theme.boxShadows.md,
              },
            })
          : {},
      ]}
    >
      {/**
       * @todo: refactor this to use `next/link` when a relative URL is passed
       * into as the `href`, to avoid a flashing white screen when the user
       * clicks on the entity's type.
       *
       * @see https://app.asana.com/0/1203179076056209/1203468350364504/f
       */}
      {onClick || href ? (
        <CardActionArea
          {...(onClick ? { onClick } : { href })}
          disableRipple
          disableTouchRipple
          sx={{
            [`&:hover .${cardActionAreaClasses.focusHighlight}`]: {
              opacity: 0,
            },
          }}
        >
          {cardContent}
        </CardActionArea>
      ) : (
        cardContent
      )}
    </Card>
  );
};
