import React, { useCallback, useContext, useEffect, useState } from 'react';

import { AuthContext } from '@context/AuthProvider';
import { t } from '@plugins/i18n';

import { Modal } from '@components/Modal';

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;
const warningTime = 5 * minute; // fallback time for the warning popup is displayed before the logout popup
const warnTimePercents = 10;

function getDeadlineTime(cookieTime: number): number {
  return new Date(cookieTime * second - new Date().getTime()).getTime();
}

function getExpiresTime(deadline: number, expiresTime: number): number {
  return deadline - ((expiresTime * second) * (warnTimePercents / 100));
}

const SessionModal: React.FC = () => {
  const authContext = useContext(AuthContext);
  // Set deadline to one hour ahead of current time.
  // Must be in seconds.
  const initDeadline = getDeadlineTime(Math.round((new Date().getTime() + hour) / second));
  // Set warn time based on 10% time less of deadline.
  // Must be in seconds.
  const initExpires = getExpiresTime(initDeadline, warningTime / second);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [logoutPopup, setLogoutPopup] = useState(false);
  const [warnTime, setWarnTime] = useState(initExpires);
  const [deadline, setDeadline] = useState(initDeadline);

  const updateTimers = useCallback((cookieTime: number, expiresInTime: number) => {
    const deadlineTime = getDeadlineTime(cookieTime);
    setDeadline(deadlineTime);
    setWarnTime(getExpiresTime(deadlineTime, expiresInTime));
  }, []);

  useEffect(() => {
    if (authContext.auth) {
      updateTimers(authContext.auth.expires, authContext.auth.expires_in);
    }
  }, [authContext.auth, updateTimers]);

  const onSessionRefresh = async () => {
    const updatedAuth = await authContext.refreshSession();

    if (updatedAuth) {
      updateTimers(updatedAuth.expires, updatedAuth.expires_in);
      setShowWarningPopup(false);
    }
  };

  useEffect(() => {
    // Wait for the Warning popup
    const warnTimer = setTimeout(() => {
      setShowWarningPopup(true);
      clearTimeout(warnTimer);
    }, warnTime);

    // Wait for the Logout popup
    const deadlineTimer = setTimeout(() => {
      setShowWarningPopup(false);
      setLogoutPopup(true);
      clearTimeout(deadlineTimer);
    }, deadline);

    return () => {
      clearTimeout(warnTimer);
      clearTimeout(deadlineTimer);
    };
  }, [deadline, warnTime]);

  return (
    <>
      {showWarningPopup && (
        <Modal
          close={authContext.logout}
          accept={onSessionRefresh}
          title={t('Your session is about to expire')}
          text={t('Do you want to stay connected?')}
          closeButtonText={t('Logout')}
          acceptButtonText={t('I want to stay connected')}
          icon={{ name: 'warning', color: 'orange' }}
          closeOnOverlayClick={false}
        />
      )}
      {logoutPopup && (
        <Modal
          accept={authContext.login}
          close={authContext.logout}
          title={t("You've been logged out")}
          text={t('To prevent unauthorized profile use, you have been logged out after 1 hour.')}
          closeButtonText={t('Return to Login page')}
          acceptButtonText={t('Sign in again')}
          icon={{ name: 'warning', color: 'red' }}
          closeOnOverlayClick={false}
        />
      )}
    </>
  );
};

export default SessionModal;
