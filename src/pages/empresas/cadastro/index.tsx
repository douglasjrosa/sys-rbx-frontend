import { Box, useToast } from "@chakra-ui/react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { FormEmpresa } from "@/components/empresa/component/form";

export default function Cadastro() {
  const { data: session } = useSession();
  const router = useRouter();
  const toast = useToast()


  return (
    <>
    <Box w={'100%'} h={'100vh'} bg="gray.800">
      <FormEmpresa envio="POST" />
    </Box>
    </>
  );
}
