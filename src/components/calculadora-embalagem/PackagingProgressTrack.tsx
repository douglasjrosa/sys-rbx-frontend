import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  Tooltip,
  useMediaQuery,
} from "@chakra-ui/react";

export type PackagingProgressStep = {
  id: number;
  label: string;
  comingSoon?: boolean;
};

const TRACK_THICKNESS_PX = 2;
const CIRCLE_ROW_MIN_HEIGHT_PX = 32;
const VERTICAL_SEGMENT_MIN_HEIGHT_PX = 20;
const LABEL_ALIGN_PT_PX = 6;
/** Filled track, completed/current ring, current step number (Chakra success) */
const PROGRESS_SUCCESS_COLOR = "green.500";

type TrackProps = {
  steps: ReadonlyArray<PackagingProgressStep>;
  currentProgressStep: number;
  textColor: string;
  progressTrackInactiveBg: string;
  /** Page/canvas bg so hollow circles hide the track line (theme-aware) */
  surfaceBg: string;
};

function stepPalette(
  progId: number,
  current: number,
  comingSoon: boolean,
) {
  const isCompleted = progId < current;
  const isCurrent = progId === current;
  const stepColor = comingSoon
    ? "gray.400"
    : isCompleted
      ? PROGRESS_SUCCESS_COLOR
      : isCurrent
        ? PROGRESS_SUCCESS_COLOR
        : "gray.300";
  return { isCompleted, isCurrent, stepColor };
}

function StepCircle( {
  isCompleted,
  isCurrent,
  isComingSoon,
  stepColor,
  surfaceBg,
  progId,
}: {
  isCompleted: boolean;
  isCurrent: boolean;
  isComingSoon: boolean;
  stepColor: string;
  surfaceBg: string;
  progId: number;
} ) {
  return (
    <Box
      w={8}
      h={8}
      borderRadius="full"
      borderWidth="2px"
      borderColor={stepColor}
      bg={isCompleted ? stepColor : surfaceBg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
    >
      {isCompleted && !isComingSoon ? (
        <Text color="white" fontSize="xs" fontWeight="bold">
          ✓
        </Text>
      ) : (
        <Text
          fontSize="xs"
          fontWeight="bold"
          color={
            isCurrent && !isComingSoon
              ? PROGRESS_SUCCESS_COLOR
              : isComingSoon
                ? "gray.400"
                : stepColor
          }
        >
          {progId}
        </Text>
      )}
    </Box>
  );
}

function PackagingProgressTrackHorizontal( {
  steps,
  currentProgressStep,
  textColor,
  progressTrackInactiveBg,
  surfaceBg,
}: TrackProps ) {
  const lastIdx = steps.length - 1;
  const colTemplate = `repeat(${steps.length}, minmax(0, 1fr))`;

  return (
    <Grid w="100%" templateColumns={colTemplate} gap={0} pb={2}>
      {steps.map( ( prog, idx ) => {
        const { isCompleted, isCurrent, stepColor } = stepPalette(
          prog.id,
          currentProgressStep,
          prog.comingSoon === true,
        );
        const segmentLeftDone =
          idx > 0 && currentProgressStep > idx;
        const segmentRightDone =
          idx < lastIdx && currentProgressStep > idx + 1;

        return (
          <GridItem key={prog.id} minW={0}>
            <Tooltip
              label={
                prog.comingSoon
                  ? "Em breve"
                  : `${prog.id}. ${prog.label}`
              }
              placement="top"
              hasArrow
            >
              <Box
                w="100%"
                opacity={prog.comingSoon ? 0.6 : 1}
                cursor="default"
              >
                <Box
                  position="relative"
                  w="100%"
                  h={`${CIRCLE_ROW_MIN_HEIGHT_PX}px`}
                >
                  {idx > 0 && (
                    <Box
                      position="absolute"
                      left={0}
                      top="50%"
                      w="50%"
                      h={`${TRACK_THICKNESS_PX}px`}
                      transform="translateY(-50%)"
                      bg={
                        segmentLeftDone
                          ? PROGRESS_SUCCESS_COLOR
                          : progressTrackInactiveBg
                      }
                      borderRadius="full"
                      aria-hidden
                    />
                  )}
                  {idx < lastIdx && (
                    <Box
                      position="absolute"
                      right={0}
                      top="50%"
                      w="50%"
                      h={`${TRACK_THICKNESS_PX}px`}
                      transform="translateY(-50%)"
                      bg={
                        segmentRightDone
                          ? PROGRESS_SUCCESS_COLOR
                          : progressTrackInactiveBg
                      }
                      borderRadius="full"
                      aria-hidden
                    />
                  )}
                  <Flex
                    position="relative"
                    zIndex={1}
                    w="100%"
                    h="100%"
                    align="center"
                    justify="center"
                  >
                    <StepCircle
                      isCompleted={isCompleted}
                      isCurrent={isCurrent}
                      isComingSoon={prog.comingSoon === true}
                      stepColor={stepColor}
                      surfaceBg={surfaceBg}
                      progId={prog.id}
                    />
                  </Flex>
                </Box>
                <Text
                  fontSize="xs"
                  color={prog.comingSoon ? "gray.400" : textColor}
                  textAlign="center"
                  w="100%"
                  px={1}
                  mt={1}
                  whiteSpace="normal"
                  wordBreak="normal"
                  overflowWrap="break-word"
                >
                  {prog.label}
                </Text>
              </Box>
            </Tooltip>
          </GridItem>
        );
      } )}
    </Grid>
  );
}

function PackagingProgressTrackVertical( {
  steps,
  currentProgressStep,
  textColor,
  progressTrackInactiveBg,
  surfaceBg,
}: TrackProps ) {
  const lastIdx = steps.length - 1;

  return (
    <Flex direction="column" w="100%" pb={2} align="stretch">
      {steps.map( ( prog, idx ) => {
        const { isCompleted, isCurrent, stepColor } = stepPalette(
          prog.id,
          currentProgressStep,
          prog.comingSoon === true,
        );
        const segmentBelowDone =
          idx < lastIdx && currentProgressStep > idx + 1;

        return (
          <Tooltip
            key={prog.id}
            label={
              prog.comingSoon
                ? "Em breve"
                : `${prog.id}. ${prog.label}`
            }
            placement="right"
            hasArrow
          >
            <Flex
              w="100%"
              align="flex-start"
              minW={0}
              opacity={prog.comingSoon ? 0.6 : 1}
              cursor="default"
            >
              <Flex
                direction="column"
                align="center"
                w={`${CIRCLE_ROW_MIN_HEIGHT_PX}px`}
                flexShrink={0}
              >
                <Box
                  h={`${CIRCLE_ROW_MIN_HEIGHT_PX}px`}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <StepCircle
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    isComingSoon={prog.comingSoon === true}
                    stepColor={stepColor}
                    surfaceBg={surfaceBg}
                    progId={prog.id}
                  />
                </Box>
                {idx < lastIdx && (
                  <Box
                    w={`${TRACK_THICKNESS_PX}px`}
                    flex="1 1 auto"
                    minH={`${VERTICAL_SEGMENT_MIN_HEIGHT_PX}px`}
                    bg={
                      segmentBelowDone
                        ? PROGRESS_SUCCESS_COLOR
                        : progressTrackInactiveBg
                    }
                    borderRadius="full"
                    aria-hidden
                  />
                )}
              </Flex>
              <Box
                flex="1 1 0"
                minW={0}
                pl={3}
                pt={`${LABEL_ALIGN_PT_PX}px`}
                pb={idx < lastIdx ? 0 : 1}
              >
                <Text
                  fontSize="xs"
                  color={prog.comingSoon ? "gray.400" : textColor}
                  textAlign="left"
                  whiteSpace="normal"
                  wordBreak="normal"
                  overflowWrap="break-word"
                >
                  {prog.label}
                </Text>
              </Box>
            </Flex>
          </Tooltip>
        );
      } )}
    </Flex>
  );
}

export function PackagingProgressTrack( props: TrackProps ) {
  const [ isPortrait ] = useMediaQuery( "(orientation: portrait)", {
    ssr: true,
    fallback: false,
  } );

  if ( isPortrait ) {
    return <PackagingProgressTrackVertical {...props} />;
  }

  return <PackagingProgressTrackHorizontal {...props} />;
}
