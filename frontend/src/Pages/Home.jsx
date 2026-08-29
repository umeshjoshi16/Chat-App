import React, { useState ,useEffect,useRef} from "react";
import axios from "axios";
import {Search,SearchX,Bell,Users,BellOff,MessageSquare,Plus,Send,Menu,X,Phone,Video,Info,} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Context/userContext";
import { io } from "socket.io-client";
import Logo from "../assets/Logo.png";


const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

const SearchAvatar = ({ user, getInitials }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

 useEffect(() => {
    setImageLoaded(false);
  }, [user?.profileImageUrl]);

  if (!user?.profileImageUrl) {
    return (
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600 shrink-0">
        {getInitials(user?.fullName)}
      </div>
    );
  }

  return (
    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
      {!imageLoaded && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}

      <img
        src={user.profileImageUrl}
        alt={user.fullName}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(false)}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};



const Home = () => {
  const {user}=useUser();
  console.log(user);
  const[notificationOpen,setNotificationOpen]=useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");

const [search, setSearch] = useState("");
const [searchResults, setSearchResults] = useState([]);
const [searchLoading, setSearchLoading] = useState(false);
const [searchOpen, setSearchOpen] = useState(false);

const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const [selectedNotification, setSelectedNotification] = useState(null);

const [newChatOpen, setNewChatOpen] = useState(false);
const [friendSearch, setFriendSearch] = useState("");
const [friends, setFriends] = useState([]);
const [friendsLoading, setFriendsLoading] = useState(false);


const [messages, setMessages] = useState([]);
const [sendingMessage, setSendingMessage] = useState(false);
const [chats, setChats] = useState([]);
const [chatSearch, setChatSearch] = useState("");

const navigate=useNavigate();


const selectedChatRef = useRef(null);

useEffect(() => {
  selectedChatRef.current = selectedChat;
}, [selectedChat]);


 const getInitials = (fullName) => {
  if (!fullName) return "";

  return fullName
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((name) => name[0].toUpperCase())
    .join("");
};
const toggleNotification = () => {
  setNotificationOpen((prev) => !prev);
};

const handleNewChat = async () => {
  setNewChatOpen(true);
  setFriendsLoading(true);

  try {
    const { data } = await api.get("/auth/friends");

    const sortedFriends = [...(data.friends || [])].sort((a, b) =>
      (a.fullName || "").localeCompare(
        b.fullName || "",
        undefined,
        { sensitivity: "base" }
      )
    );

    setFriends(sortedFriends);
  } catch (error) {
    console.error("Failed to fetch friends:", error);

    toast.error(
      error.response?.data?.message || "Failed to load friends"
    );

    setFriends([]);
  } finally {
    setFriendsLoading(false);
  }
};

const filteredFriends = friends.filter((friend) => {
  const value = friendSearch.trim().toLowerCase();

  if (!value) return true;

  return (
    friend.fullName?.toLowerCase().includes(value) ||
    friend.username?.toLowerCase().includes(value)
  );
});

const handleSendFriendRequest = async (recipientId) => {
  try {
    const { data } = await api.post(
      `/auth/send-request/${recipientId}`
    );

    toast.success("Friend request sent!");
    

    setSearchResults((prev) =>
      prev.map((u) =>
        u._id === recipientId
          ? {
              ...u,
              friendshipStatus: "pending_sent",
            }
          : u
      )
    );
  } catch (error) {
     toast.error(
      error.response?.data?.message || "Failed to send friend request"
    );
    
  }
};

const handleCancelFriendRequest = async (friendshipId, userId) => {
  try {
    if (!friendshipId) {
      toast.error("Friendship not found");
      return;
    }

    await api.delete(`/auth/cancel-request/${friendshipId}`);

    toast.success("Friend request cancelled");

    setSearchResults((prev) =>
      prev.map((u) =>
        u._id === userId
          ? {
              ...u,
              friendshipStatus: "none",
              friendshipId: null,
            }
          : u
      )
    );
  } catch (error) {
    console.error("Cancel request error:", error);

    toast.error(
      error.response?.data?.message ||
        "Failed to cancel friend request"
    );
  }
};

const handleAcceptFriendRequest = async () => {
  try {
    const friendshipId = selectedNotification?.data?.friendshipId;

    if (!friendshipId) {
      toast.error("Friend request not found");
      return;
    }

    await api.put(`/auth/accept-request/${friendshipId}`);

    toast.success("Friend request accepted");

    setNotifications((prev) =>
      prev.filter(
        (notification) =>
          notification._id !== selectedNotification._id
      )
    );

    setSelectedNotification(null);
  } catch (error) {
    console.error("Accept friend request error:", error);

    toast.error(
      error.response?.data?.message ||
        "Failed to accept friend request"
    );
  }
};

const handleRejectFriendRequest = async () => {
  try {
    const friendshipId = selectedNotification?.data?.friendshipId;

    if (!friendshipId) {
      toast.error("Friend request not found");
      return;
    }

    await api.delete(`/auth/reject-request/${friendshipId}`);

    toast.success("Friend request rejected");

    setNotifications((prev) =>
      prev.filter(
        (notification) =>
          notification._id !== selectedNotification._id
      )
    );

    setSelectedNotification(null);
  } catch (error) {
    console.error("Reject friend request error:", error);

    toast.error(
      error.response?.data?.message ||
        "Failed to reject friend request"
    );
  }
};

useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/auth/notifications");
      console.log('nptifcation',data);

      setNotifications(data.notifications);
      

      setUnreadCount(
        data.notifications.filter((notification) => !notification.seen).length
      );
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  if (user?._id) {
    fetchNotifications();
  }
}, [user]);

//socket
useEffect(() => {
  if (!user?._id) return;

  const socket = io("http://localhost:3000", {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);

    socket.emit("register", user._id);
  });

  socket.on("friend_request", (notification) => {
    console.log("New friend request:", notification);

    setNotifications((prev) => [
      notification,
      ...prev,
    ]);

    setUnreadCount((prev) => prev + 1);
  });

 
  socket.on("new_message", (newMessage) => {
 

  setMessages((prev) => {
    

    return [...prev, newMessage];
  });
});
  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });

  return () => {
    socket.disconnect();
  };
}, [user?._id]);


useEffect(() => {
  if (!search.trim()) {
    setSearchResults([]);
    setSearchOpen(false);
    return;
  }

  const timer = setTimeout(async () => {
    try {
      setSearchLoading(true);

      const { data } = await api.get("/auth/users/search", {
        params: {
          query: search.trim(),
        },
      });

      const usersWithStatus = await Promise.all(
        data.users.map(async (u) => {
          try {
            const { data: statusData } = await api.get(
              `/auth/status/${u._id}`
            );

            
      return {
        ...u,
        friendshipStatus: statusData.status,
        friendshipId: statusData.friendshipId,
      };
          } catch (error) {
            return {
              ...u,
              friendshipStatus: "none",
            };
          }
        })
      );

      setSearchResults(usersWithStatus);
      setSearchOpen(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, 300);

  return () => clearTimeout(timer);
}, [search]);
  
 


  const handleNotificationClick = async (notification) => {
  try {
    if (!notification.seen) {
      await api.put(
        `/auth/notifications/${notification._id}/seen`
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id
            ? { ...item, seen: true }
            : item
        )
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
       
    }
     if (notification.type === "friend_request") {
      setSelectedNotification(notification);
    }
  } catch (error) {
    console.error("Failed to mark notification as seen:", error);
  }
};

const handleSendMessage = async (e) => {
  e.preventDefault();

  const text = messageInput.trim();

  if (!text) return;

  if (!selectedChat?._id) {
    toast.error("Please select a user first");
    return;
  }

  try {
    setSendingMessage(true);

    const { data } = await api.post("/auth/message/sent", {
      receiverId: selectedChat._id,
      message: text,
      messageType: "text",
    });

    if (data.success) {
      const newMessage = data.data;

     
      setMessages((prev) => [...prev, newMessage]);

     
      setChats((prevChats) => {
        const existingChat = prevChats.find(
          (chat) => chat.user?._id?.toString() === selectedChat._id?.toString()
        );

        if (existingChat) {
       
         const updatedChat = {
  ...existingChat,
  lastMessage: newMessage.message,
  lastMessageAt: newMessage.createdAt,
};

          return [
            updatedChat,
            ...prevChats.filter(
              (chat) =>
                chat.user?._id?.toString() !==
                selectedChat._id?.toString()
            ),
          ];
        }

     
       return [
  {
    user: selectedChat,
    lastMessage: newMessage.message,
    lastMessageAt: newMessage.createdAt,
    lastMessageType: newMessage.messageType,
  },
  ...prevChats,
];
      });

      setMessageInput("");
    }
  } catch (error) {
    console.error("Send message error:", error);

    toast.error(
      error.response?.data?.message ||
        "Failed to send message"
    );
  } finally {
    setSendingMessage(false);
  }
};

const getChats = async () => {
  try {
    const { data } = await api.get("/auth/message/chats");
   console.log('chats are',data);
    if (data.success) {
      setChats(data.chats);
    }
  } catch (error) {
    console.error("Failed to get chats:", error);
  }
};

useEffect(() => {
  if (user?._id) {
    getChats();
  }
}, [user?._id]);

const getMessages = async (userId) => {
  try {
    const { data } = await api.get(
      `/auth/message/${userId}`
    );

    if (data.success) {
      setMessages(data.messages || []);
    }
  } catch (error) {
    console.error("Failed to fetch messages:", error);

    toast.error(
      error.response?.data?.message ||
      "Failed to load messages"
    );

    setMessages([]);
  }
};

useEffect(() => {
  if (!selectedChat?._id) {
    setMessages([]);
    return;
  }

  getMessages(selectedChat._id);
}, [selectedChat?._id]);

const filteredChats = chats.filter((chat) => {
  const value = chatSearch.trim().toLowerCase();

  if (!value) return true;

  return (
    chat.user?.fullName?.toLowerCase().includes(value) ||
    chat.user?.username?.toLowerCase().includes(value)
  );
});

 

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans">
      
      <header className="flex items-center justify-between px-4 lg:px-6 h-16 bg-white border-b border-slate-200 z-30 shrink-0">
       
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center gap-2">
           
           <img src={Logo} alt="logo" className="md:h-12 h-8 cursor-pointer" />
            
          </div>
        </div>

       
        <div className="hidden md:flex relative w-96">
  <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />

  <input
    type="text"
    placeholder="Search users..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full bg-slate-100 text-slate-800 text-sm rounded-xl pl-9 pr-4 py-2 border border-transparent focus:bg-white focus:border-teal-500  focus:outline-none"
  />

  {searchOpen && (
    <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto no-scrollbar">
      {searchLoading ? (
        <div className="p-4 text-center text-gray-500">
          Searching...
        </div>
      ) : searchResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4">
  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
    <SearchX className="h-7 w-7 text-slate-400" />
  </div>

  <h3 className="mt-4 text-sm font-semibold text-slate-700">
    No users found
  </h3>

  <p className="mt-1 text-center text-xs text-slate-500">
    Try searching with a different name or username.
  </p>
</div>
      ) : (
  searchResults.map((u) => (
  <button
    key={u._id}
    onClick={() => {
      console.log("Selected user:", u);

      setSelectedChat(u);

      setSearch("");
      setSearchOpen(false);
    }}
    className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 transition cursor-pointer "
  >
    <SearchAvatar
      user={u}
      getInitials={getInitials}
    />

   <div className="flex items-center w-full">
  <div className="text-left min-w-0">
    <p className="font-medium text-gray-800 truncate">
      {u.fullName}
    </p>

    <p className="text-[12px] text-gray-500 truncate">
      @{u.username}
    </p>
  </div>
<button
  onClick={(e) => {
    e.stopPropagation();

    if (u.friendshipStatus === "none") {
      handleSendFriendRequest(u._id);
    }

    if (u.friendshipStatus === "pending_sent") {
      handleCancelFriendRequest(
        u.friendshipId,
        u._id
      );
    }
  }}
  disabled={
    u.friendshipStatus === "pending_received" ||
    u.friendshipStatus === "friends"
  }
  className={`ml-auto px-3 py-1.5 text-sm font-medium ${
    u.friendshipStatus === "friends"
      ? "text-green-600 cursor-default"
      : u.friendshipStatus === "pending_sent"
      ? "text-gray-500 hover:text-gray-700 cursor-pointer"
      : u.friendshipStatus === "pending_received"
      ? "text-teal-600 cursor-default"
      : "text-teal-600 hover:text-teal-700 cursor-pointer"
  }`}
>
  {u.friendshipStatus === "friends"
    ? "Friends"
    : u.friendshipStatus === "pending_sent"
    ? "Cancel Request"
    : u.friendshipStatus === "pending_received"
    ? "Respond"
    : "Add Friend"}
</button>
</div>
  </button>
))
)}
    </div>
  )}
</div>

       
        <div className="flex items-center gap-3">
          <button
  onClick={toggleNotification}
  className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
>
  <Bell className="w-5 h-5" />

  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  )}
</button>
          <button onClick={()=>{
            navigate('/profile')
          }} className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer">
           <div className="w-9 h-9 bg-blue-100 text-teal-600 rounded-full flex items-center justify-center font-semibold text-sm overflow-hidden ">
  {user?.profileImageUrl ? (
    <img
      src={user.profileImageUrl}
      alt={user.fullName}
      className="w-full h-full object-cover"
    />
  ) : (
    getInitials(user?.fullName)
  )}
</div>
            <span className="hidden sm:inline font-medium text-sm text-slate-700">{user ? user.fullName : "................."}</span>
          </button>
        </div>
         
      </header>

{notificationOpen && (
  <div
    onClick={() => setNotificationOpen(false)}
    className="fixed inset-0 z-50 bg-black/30"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed right-4 top-16 w-70 md:w-85 h-fit min-h-85 origin-top-right animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-150 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5"
    >

      
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-50 p-2">
            <Bell className="h-5 w-5 text-teal-600" />
          </div>

          <div>
            <h2 className="text-[15px] font-semibold text-gray-900">
              Notifications
            </h2>

            <p className="text-xs text-gray-500">
              Stay updated with your activity
            </p>
          </div>
        </div>

        <button
          onClick={() => setNotificationOpen(false)}
          className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      
      <div className="max-h-96 overflow-y-auto">

        {notifications.length === 0 ? (

         
          <div className="flex flex-col items-center justify-center px-8 py-14">
            <div className="rounded-full bg-gray-50 p-5 ring-1 ring-gray-100">
              <BellOff
                className="h-8 w-8 text-gray-300"
                strokeWidth={1.5}
              />
            </div>

            <h3 className="mt-5 text-base font-medium text-gray-800">
              No notifications yet
            </h3>

            <p className="mt-1.5 text-center text-[13px] leading-relaxed text-gray-400">
              You're all caught up!
              <br />
              New activity will show up here.
            </p>
          </div>

        ) : (

          
          notifications.map((notification) => (
            <button
              key={notification._id}
              onClick={() =>
                handleNotificationClick(notification)
              }
              className={`w-full flex items-center gap-3 px-5 py-4 text-left border-b border-gray-100 transition cursor-pointer ${
                notification.seen
                  ? "bg-white hover:bg-gray-50"
                  : "bg-blue-50 hover:bg-blue-100"
              }`}
            >

              
              <SearchAvatar
                user={notification.sender}
                getInitials={getInitials}
              />

              <div className="flex-1 min-w-0">

                <p className="text-sm text-gray-800">
                  <span className="font-semibold">
                    {notification.sender?.fullName}
                  </span>

                  {notification.type === "friend_request" &&
                    " sent you a friend request."}

                  {notification.type === "friend_accept" &&
                    " accepted your friend request."}

                  {notification.type === "message" &&
                    ` ${notification.message}`}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(
                    notification.createdAt
                  ).toLocaleString()}
                </p>

              </div>

            
              {!notification.seen && (
                <span className="w-2.5 h-2.5 bg-teal-500 rounded-full shrink-0" />
              )}

            </button>
          ))

        )}

      </div>
    </div>
  </div>
)}

{selectedNotification && (
  <div
    onClick={() => setSelectedNotification(null)}
    className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="relative bg-white w-full max-w-md rounded-2xl border border-[#E5E7EB] shadow-2xl p-6 md:p-8"
    >
      <button
        type="button"
        onClick={() => setSelectedNotification(null)}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-[#6B7280] hover:bg-[#F5F6F8] hover:text-[#12151C] transition-colors cursor-pointer"
        aria-label="Close"
      >
        <X className="w-5 h-5" strokeWidth={2.5} />
      </button>

      <div className="flex flex-col items-center text-center pt-2">
       

        <div className="scale-150">
  <SearchAvatar
    user={selectedNotification.sender}
    getInitials={getInitials}
  />
</div>
       

        <h2 className="mt-4 heading text-xl font-bold text-[#12151C]">
          {selectedNotification.sender?.fullName}
        </h2>

        <p className="mt-1 text-sm heading text-[#6B7280]">
          @{selectedNotification.sender?.username}
        </p>
      </div>

      <div className="mt-6 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] p-4">
        <h3 className="text-sm font-semibold text-[#12151C] mb-2">
          Friend Request
        </h3>

        <p className="text-sm  text-[#6B7280] leading-relaxed">
          {selectedNotification.message}
        </p>
      </div>
<div className="flex gap-3 mt-6">
  <button
    type="button"
    onClick={handleRejectFriendRequest}
    className="flex-1 px-5 py-2.5 rounded-xl border border-[#E5E7EB] text-sm font-medium text-[#6B7280] hover:bg-[#F5F6F8] hover:text-[#12151C] transition-colors cursor-pointer"
  >
    Reject
  </button>

  <button
    type="button"
    onClick={handleAcceptFriendRequest}
    className="flex-1 px-5 py-2.5 rounded-xl bg-teal-600 text-sm font-medium text-white hover:bg-teal-700 transition-colors cursor-pointer"
  >
    Accept
  </button>
</div>
    </div>
  </div>
)}

{newChatOpen && (
  <div
    onClick={() => setNewChatOpen(false)}
    className="fixed inset-0 z-100 bg-black/40 flex items-center justify-center p-4"
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-lg min-h-[85vh] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            New Chat
          </h2>

          <p className="text-xs text-slate-500 mt-0.5">
            Choose a friend to start chatting
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewChatOpen(false)}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />

          <input
            type="text"
            value={friendSearch}
            onChange={(e) => setFriendSearch(e.target.value)}
            placeholder="Search friends..."
            className="w-full bg-slate-100 text-slate-800 text-sm rounded-xl pl-9 pr-4 py-2.5 border border-transparent focus:bg-white focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {friendsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-5 h-5 border-2 border-slate-200 border-t-teal-600 rounded-full animate-spin" />
          </div>
        ) : filteredFriends.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
              <Users className="w-7 h-7 text-slate-400" />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-700">
              {friends.length === 0
                ? "No friends yet"
                : "No friends found"}
            </h3>

            <p className="mt-1 text-xs text-slate-500 max-w-xs">
              {friends.length === 0
                ? "Add some friends to start a conversation."
                : "Try searching with a different name or username."}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredFriends.map((friend) => (
              <button
                key={friend._id}
                type="button"
                onClick={() => {
                  setSelectedChat(friend);
                  setNewChatOpen(false);
                  setFriendSearch("");
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left"
              >
                <SearchAvatar
                  user={friend}
                  getInitials={getInitials}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {friend.fullName}
                  </p>

                  <p className="text-xs text-slate-500 truncate">
                    @{friend.username}
                  </p>
                </div>

                <MessageSquare className="w-4 h-4 text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}
    

    
      <div className="flex flex-1 overflow-hidden relative">
        
      
       

    {sidebarOpen && (
  <div
    onClick={() => setSidebarOpen(false)}
    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
  />
)}

<aside
  className={`absolute lg:relative z-20 inset-y-0 left-0 w-80 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${
    sidebarOpen
      ? "translate-x-0"
      : "-translate-x-full lg:translate-x-0"
  }`}
>
  <div className="p-4 border-b border-slate-100">
    <div className="relative">
      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />

      <input
        type="text"
        placeholder="Search Chats..."
        value={chatSearch}
        onChange={(e) => setChatSearch(e.target.value)}
        className="w-full bg-slate-100 text-slate-800 text-sm rounded-xl pl-9 pr-4 py-2.5 border border-transparent focus:bg-white focus:border-teal-600 focus:outline-none transition-all"
      />

      {chatSearch.trim() && (
        <button
          type="button"
          onClick={() => setChatSearch("")}
          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X size={18} strokeWidth={3} />
        </button>
      )}
    </div>
  </div>

  <div className="flex-1 overflow-y-auto px-3 py-2">
    {chats.length === 0 ? (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <MessageSquare className="w-7 h-7 text-slate-400" />
        </div>

        <h3 className="text-sm font-semibold text-slate-700">
          No conversations yet
        </h3>

        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
          Start a new conversation with one of your friends.
        </p>

        <button
          type="button"
          onClick={handleNewChat}
          className="mt-4 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          Start New Chat
        </button>
      </div>
    ) : filteredChats.length === 0 ? (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <SearchX className="w-6 h-6 text-slate-400" />
        </div>

        <h3 className="text-sm font-semibold text-slate-700">
          No chats found
        </h3>

        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
          No conversation matches{" "}
          <span className="font-medium text-slate-700">
            "{chatSearch}"
          </span>
        </p>

        <button
          type="button"
          onClick={() => setChatSearch("")}
          className="mt-4 text-[15px] font-medium text-teal-600 hover:text-teal-700 cursor-pointer"
        >
          Clear search
        </button>
      </div>
    ) : (
      <div className="space-y-1">
        {filteredChats.map((chat) => {
          const isSearching = chatSearch.trim().length > 0;

          const isSelected =
            selectedChat?._id?.toString() ===
            chat.user?._id?.toString();

          return (
            <button
              key={chat.user._id}
              type="button"
              onClick={() => {
                setSelectedChat(chat.user);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-xl text-left transition-all border cursor-pointer ${
                isSelected
                  ? "bg-teal-50 border-teal-200"
                  : isSearching
                  ? "bg-white border-slate-200 hover:border-teal-200 hover:bg-teal-50/40"
                  : "border-transparent hover:bg-slate-50"
              }`}
            >
              <SearchAvatar
                user={chat.user}
                getInitials={getInitials}
              />

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2">
                  <h3
                    className={`text-sm font-semibold truncate ${
                      isSelected
                        ? "text-teal-700"
                        : "text-slate-800"
                    }`}
                  >
                    {chat.user.fullName}
                  </h3>

                  {chat.lastMessageAt && (
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(
                        chat.lastMessageAt
                      ).toDateString() ===
                      new Date().toDateString()
                        ? new Date(
                            chat.lastMessageAt
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : new Date(
                            chat.lastMessageAt
                          ).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                          })}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 truncate">
                  @{chat.user.username}
                </p>

                <p
                  className={`text-xs truncate mt-0.5 ${
                    isSelected
                      ? "text-teal-600"
                      : "text-slate-500"
                  }`}
                >
                  {chat.lastMessage || "No messages yet"}
                </p>
              </div>

              {isSelected && (
                <div className="w-1 h-8 bg-teal-600 rounded-full shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    )}
  </div>

  <div className="p-4 border-t border-slate-100">
    <button
      type="button"
      onClick={handleNewChat}
      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] cursor-pointer"
    >
      <Plus className="w-4 h-4" />
      <span>New Chat</span>
    </button>
  </div>
</aside>

        
        <main className="flex-1 flex flex-col bg-white overflow-hidden">
          {selectedChat ? (
            <>
   
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white shrink-0">

     
      <div className="flex items-center gap-3 min-w-0">

        
        <SearchAvatar
          user={selectedChat}
          getInitials={getInitials}
        />

       
        <div className="min-w-0">

          <h2 className="text-sm font-semibold text-slate-900 truncate">
            {selectedChat.fullName}
          </h2>

          <p className="text-xs text-slate-500 truncate">
            @{selectedChat.username}
          </p>

          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />

            <span className="text-[11px] text-emerald-600 font-medium">
              online
            </span>
          </div>

        </div>
      </div>


    
      <button
        onClick={() => setSelectedChat(null)}
        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
        aria-label="Close chat"
      >
        <X size={18} strokeWidth={3} />
      </button>

    </div>


   
   <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">

  {messages.length === 0 ? (
    <div className="h-full flex flex-col items-center justify-center text-center">

      <SearchAvatar
        user={selectedChat}
        getInitials={getInitials}
      />

      <h3 className="mt-4 text-sm font-semibold text-slate-700">
        No messages
      </h3>

      <p className="mt-1 text-xs text-slate-500 max-w-xs">
        Start a conversation with {selectedChat.fullName}
      </p>

    </div>
  ) : (
    <div className="space-y-2">

      {messages.map((msg) => {

        const isMine =
          msg.sender?._id?.toString() === user?._id?.toString();

        return (
          <div
            key={msg._id}
            className={`flex ${
              isMine
                ? "justify-end"
                : "justify-start"
            }`}
          >
<div
  className={`max-w-[70%] px-4 py-1 text-sm ${
    isMine
      ? "bg-teal-600 text-white rounded-t-2xl rounded-bl-2xl rounded-br-0 shadow-sm"
      : "bg-white text-slate-800 rounded-t-2xl rounded-br-2xl rounded-bl-0 shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)]"
  }`}
>
  <p className="wrap-break-word leading-relaxed">
    {msg.message}
  </p>

  <p
    className={`text-[10px] mt-1 text-right ${
      isMine ? "text-teal-100/80" : "text-slate-400"
    }`}
  >
    {new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}
  </p>
</div>

          </div>
        );
      })}

    </div>
  )}

</div>


    
    <form
      onSubmit={handleSendMessage}
      className="p-4 bg-white border-t border-slate-200 shrink-0 flex items-center gap-3"
    >

      <input
        type="text"
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        placeholder={`Message ${selectedChat.fullName}...`}
        className="flex-1 bg-slate-100 text-slate-800 text-sm rounded-xl px-4 py-3 border border-transparent focus:bg-white focus:border-teal-500 focus:outline-none transition-all"
      />

      <button
  type="submit"
  disabled={sendingMessage || !messageInput.trim()}
  className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white p-3 rounded-xl flex items-center justify-center transition-all shadow-sm cursor-pointer"
>
  <Send className="w-4 h-4" />
</button>

    </form>
  </>
          ) : (
          
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
              
               
              
              <h3 className="text-xl font-bold text-gray-400 mb-1 flex flex-col flex-center items-center text-center heading">Welcome to <img src={Logo} alt="logo" className="h-15 rounded-xl"/></h3>
              <p className="text-sm sub-heading text-slate-500 max-w-md">
                Select a conversation from the sidebar to start chatting or create a new chat.
              </p>
            </div>
          )}
        </main>
      </div>

      

      
    </div>
  );
};



export default Home;

