import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Container,
  Modal,
  Table,
  Alert,
  Spinner,
} from "react-bootstrap";
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
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Email Data Synchronization</h1>
        <p className="lead">
          <small>Sync-Status: {syncStatus}</small>
        </p>
        <p className="lead">
          <small>Connection Status: {connectionStatus}</small>
        </p>
        {isRetrying && (
          <p className="lead">
            <small>Retrying to connect... (Attempt {retryCount})</small>
            <Spinner animation="border" size="sm" />
          </p>
        )}
        {connectionStatus !== "Connected" && !isRetrying && (
          <Button onClick={attemptReconnect} variant="primary">
            Retry Connection
          </Button>
        )}
      </div>
      {connectionStatus !== "Connected" && (
        <Alert variant="danger">Connection issue: {connectionStatus}</Alert>
      )}
      <Table bordered striped hover responsive>
        <thead className="thead-light">
          <tr>
            <th>Subject</th>
            <th>Sender name</th>
            <th>Status</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
          {emails.map((email) => (
            <CSSTransition key={email.id} timeout={500} classNames="email-new">
              <tr
                key={email.id}
                onClick={() => handleRowClick(email)}
                className="cursor-pointer"
              >
                <td>
                  <strong>{email.subject}</strong>
                </td>
                <td>{email.sender.emailAddress.name}</td>
                <td>
                  {email.isRead ? (
                    <FontAwesomeIcon icon={faEnvelopeOpen} title="Read" className="email-icon-glow-read" />
                  ) : (
                    <FontAwesomeIcon icon={faEnvelope} title="Unread" className="email-icon-glow-read" />
                  )}
                  {email.isMoved && (
                    <FontAwesomeIcon
                      icon={faFolder}
                      title="Moved"
                      className="ml-2"
                    />
                  )}
                </td>
                <td>
                  {email.isFlagged && (
                    <FontAwesomeIcon icon={faFlag} title="Flagged" className="email-icon-glow-flag" />
                  )}
                  {email.isDeleted && (
                    <FontAwesomeIcon icon={faTrash} title="Deleted" />
                  )}
                </td>
              </tr>
            </CSSTransition>
          ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedEmail?.subject}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>From:</strong> {selectedEmail?.sender.emailAddress.name}
          </p>
          <p>
            <strong>Email:</strong> {selectedEmail?.sender.emailAddress.address}
          </p>
          <p>
            <strong>Received:</strong> {selectedEmail?.receivedDateTime}
          </p>
          <div>
            <strong>Body:</strong>
            <div
              dangerouslySetInnerHTML={{ __html: selectedEmail?.bodyPreview }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button type="button" variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default EmailPage;
