import React from 'react';
import { Text, Link } from '@chakra-ui/react';
import { useLoginThemeFx } from '../styles/theme-fx';
import { useT } from '../../../hooks/useT';
import type { AuthToggleProps } from '../types';

export const AuthToggle: React.FC<AuthToggleProps> = ({ isLogin, onToggle }) => {
  const { textMuted, linkColor } = useLoginThemeFx();
  const t = useT();

  return (
    <Text textAlign="center" mt={6} fontSize="sm" color={textMuted}>
      {isLogin ? t("auth.no_account") : t("auth.has_account")}
      <Link
        color={linkColor}
        fontWeight="bold"
        onClick={onToggle}
        _hover={{ textDecoration: 'underline' }}
      >
        {isLogin ? t("auth.register_link") : t("auth.login_link")}
      </Link>
    </Text>
  );
};
