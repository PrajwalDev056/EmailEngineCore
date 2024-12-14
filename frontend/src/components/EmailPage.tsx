import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Container,
  Modal,
  Table,
  Alert,
  CircularProgress,
  Box,
  Typography,
  IconButton,
  Tooltip,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from "@mui/material";
import { CSSTransition } from 'react-transition-group';
import AxiosWrapper from "../utils/AxiosWrapper";
import { useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { Email } from "../types/EmailType";
import socket from "../utils/Socket";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faEnvelopeOpen,
  faFlag,
  faTrash,
  faFolder,
} from "@fortawesome/free-solid-svg-icons";
import { AppConst } from "../utils/AppConstant";
import { debounce } from "lodash";

/**
 * EmailPage component
 * This component displays a list of emails and handles real-time updates using WebSocket.
 * It uses AxiosWrapper for API requests and MSAL for authentication.
 */
const EmailPage: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Not Started");
  const [connectionStatus, setConnectionStatus] = useState("Connected");
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const axiosWrapper = new AxiosWrapper(AppConst.API_BASEURL, true);

  const navigate = useNavigate();
  const { accounts } = useMsal();
  const isAuthenticated = accounts.length > 0;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }

    const fetchEmails = async () => {
      setSyncStatus("Syncing...");
      try {
        const response = await axiosWrapper.get("email/get");
        setEmails(response.data);
        setSyncStatus("Completed");
      } catch (error: any) {
        console.error("Error fetching emails", error);
        setSyncStatus("Error");
      }
    };

    fetchEmails();
  }, [isAuthenticated, navigate]);

  const handleEmailCreated = useCallback(
    debounce((email: Email) => {
      console.log(`emailCreated Event: ${email}`);
      setEmails((prevEmails) => [email, ...prevEmails]);
    }, 300),
    []
  );

  const handleEmailUpdated = useCallback(
    debounce((updatedEmail: Email) => {
      console.log(`emailUpdated Event: ${updatedEmail}`);
      setEmails((prevEmails) =>
        prevEmails.map((email) =>
          email.id === updatedEmail.id ? updatedEmail : email
        )
      );
    }, 300),
    []
  );

  const handleEmailDeleted = useCallback(
    debounce((emailId: string) => {
      console.log(`emailDeleted Event: ${emailId}`);
      setEmails((prevEmails) =>
        prevEmails.filter((email) => email.id !== emailId)
      );
    }, 300),
    []
  );

  const attemptReconnect = useCallback(() => {
    if (isRetrying) return;

    setIsRetrying(true);
    let retries = 0;
    const maxRetries = 5;
    const retryInterval = setInterval(() => {
      if (retries >= maxRetries) {
        clearInterval(retryInterval);
        setIsRetrying(false);
        return;
      }

      socket.connect();
      retries += 1;
      setRetryCount(retries);
    }, 2000 * retries);
  }, [isRetrying]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to the server");
      setConnectionStatus("Connected");
      setIsRetrying(false);
      setRetryCount(0);
    });

    socket.on("disconnect", (reason) => {
      console.warn("Disconnected from server:", reason);
      setConnectionStatus("Disconnected");
      attemptReconnect();
    });

    socket.on("reconnect_attempt", () => {
      console.log("Attempting to reconnect to server...");
      setConnectionStatus("Reconnecting...");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnectionStatus("Connection Error");
      attemptReconnect();
    });

    socket.on("emailCreated", handleEmailCreated);
    socket.on("emailUpdated", handleEmailUpdated);
    socket.on("emailDeleted", handleEmailDeleted);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("reconnect_attempt");
      socket.off("connect_error");
      socket.off("emailCreated", handleEmailCreated);
      socket.off("emailUpdated", handleEmailUpdated);
      socket.off("emailDeleted", handleEmailDeleted);
    };
  }, [
    attemptReconnect,
    handleEmailCreated,
    handleEmailUpdated,
    handleEmailDeleted,
  ]);

  const handleRowClick = (email: Email) => {
    setSelectedEmail(email);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmail(null);
  };

  return (
    <Container className="main-content">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} borderBottom={1} pb={2}>
        <Typography variant="h4">Email Data Synchronization</Typography>
        <Typography variant="subtitle1">
          <small>Sync-Status: {syncStatus}</small>
        </Typography>
        <Typography variant="subtitle1">
          <small>Connection Status: {connectionStatus}</small>
        </Typography>
        {isRetrying && (
          <Typography variant="subtitle1">
            <small>Retrying to connect... (Attempt {retryCount})</small>
            <CircularProgress size={20} />
          </Typography>
        )}
        {connectionStatus !== "Connected" && !isRetrying && (
          <Button onClick={attemptReconnect} variant="contained" color="primary">
            Retry Connection
          </Button>
        )}
      </Box>
      {connectionStatus !== "Connected" && (
        <Alert severity="error">Connection issue: {connectionStatus}</Alert>
      )}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Subject</TableCell>
              <TableCell>Sender name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Flag</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {emails.map((email) => (
              <CSSTransition key={email.id} timeout={500} classNames="email-new">
                <TableRow
                  key={email.id}
                  onClick={() => handleRowClick(email)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <strong>{email.subject}</strong>
                  </TableCell>
                  <TableCell>{email.sender.emailAddress.name}</TableCell>
                  <TableCell>
                    {email.isRead ? (
                      <Tooltip title="Read">
                        <IconButton>
                          <FontAwesomeIcon icon={faEnvelopeOpen} className="email-icon-glow-read" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Unread">
                        <IconButton>
                          <FontAwesomeIcon icon={faEnvelope} className="email-icon-glow-read" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {email.isMoved && (
                      <Tooltip title="Moved">
                        <IconButton>
                          <FontAwesomeIcon icon={faFolder} className="ml-2" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                  <TableCell>
                    {email.isFlagged && (
                      <Tooltip title="Flagged">
                        <IconButton>
                          <FontAwesomeIcon icon={faFlag} className="email-icon-glow-flag" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {email.isDeleted && (
                      <Tooltip title="Deleted">
                        <IconButton>
                          <FontAwesomeIcon icon={faTrash} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              </CSSTransition>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={showModal} onClose={handleCloseModal}>
        <Box>
          <Typography variant="h6">{selectedEmail?.subject}</Typography>
          <Typography>
            <strong>From:</strong> {selectedEmail?.sender.emailAddress.name}
          </Typography>
          <Typography>
            <strong>Email:</strong> {selectedEmail?.sender.emailAddress.address}
          </Typography>
          <Typography>
            <strong>Received:</strong> {selectedEmail?.receivedDateTime}
          </Typography>
          <Box>
            <strong>Body:</strong>
            <div
              dangerouslySetInnerHTML={{ __html: selectedEmail?.bodyPreview }}
            />
          </Box>
          <Button type="button" variant="contained" color="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default EmailPage;
