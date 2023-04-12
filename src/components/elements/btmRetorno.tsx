import { Box, FormLabel, IconButton, Select } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { FaArrowLeft } from "react-icons/fa";

export const BtmRetorno = (props: { Url: string }) => {
  const router = useRouter();
  return (
    <>
      <IconButton
        aria-label="Send"
        fontSize={"xl"}
        icon={<FaArrowLeft />}
        color="gray.600"
        onClick={() => router.push(props.Url)}
      />
    </>
  );
};
