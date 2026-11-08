import * as React from 'react';
import { cn } from '@/lib/utils';

type Shape =
  | ['path', string]
  | ['circle', number, number, number]
  | ['rect', number, number, number, number, number];

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
  /** Stroke width on the 24px grid. */
  weight?: number;
  /** Off by default, so a plain icon is fully static. Set it to redraw the strokes when the icon (or a `group` parent) is hovered. */
  draw?: boolean;
  /** Milliseconds each stroke takes to draw. Only used with `draw`. */
  speed?: number;
}

function make(name: string, shapes: Shape[]) {
  const Icon = ({ weight = 1.75, draw, speed = 900, className, style, ...props }: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={weight}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={props['aria-label'] ? undefined : true}
      className={cn('size-4 shrink-0', draw && 'icon-draw', className)}
      style={draw ? ({ '--icon-ms': `${speed}ms`, ...style } as React.CSSProperties) : style}
      {...props}
    >
      {shapes.map((s, i) => {
        const st = { '--i': i } as React.CSSProperties;
        return s[0] === 'path' ? <path key={i} d={s[1]} pathLength={1} style={st} />
          : s[0] === 'circle' ? <circle key={i} cx={s[1]} cy={s[2]} r={s[3]} pathLength={1} style={st} />
          : <rect key={i} x={s[1]} y={s[2]} width={s[3]} height={s[4]} rx={s[5]} pathLength={1} style={st} />;
      })}
    </svg>
  );
  Icon.displayName = name;
  return Icon;
}

const p = (d: string): Shape => ['path', d];

export const BefMark = make('BefMark', [p('M8 4v16h6a4 4 0 0 0 0-8H8h5a4 4 0 0 0 0-8H8')]);
export const SearchIcon = make('SearchIcon', [['circle', 11, 11, 6], p('M20 20l-4.5-4.5')]);
export const CopyIcon = make('CopyIcon', [['rect', 9, 9, 11, 11, 2.5], p('M15 5H6.5A1.5 1.5 0 0 0 5 6.5V15')]);
export const CheckIcon = make('CheckIcon', [p('M5 12.5l4.5 4.5L19 7.5')]);
export const XIcon = make('XIcon', [p('M6 6l12 12M18 6L6 18')]);
export const PlusIcon = make('PlusIcon', [p('M12 5v14M5 12h14')]);
export const MenuIcon = make('MenuIcon', [p('M4 7h16M4 12h10M4 17h16')]);
export const ArrowRightIcon = make('ArrowRightIcon', [p('M5 12h14M13 6l6 6-6 6')]);
export const ChevronRightIcon = make('ChevronRightIcon', [p('M9 6l6 6-6 6')]);
export const SunIcon = make('SunIcon', [['circle', 12, 12, 4], p('M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4')]);
export const MoonIcon = make('MoonIcon', [p('M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z')]);
export const SparkleIcon = make('SparkleIcon', [p('M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z'), p('M19 17v4M17 19h4')]);
export const ZapIcon = make('ZapIcon', [p('M13 3L5 13.5h6L10 21l9-11h-6z')]);
export const ComponentsIcon = make('ComponentsIcon', [['rect', 4, 4, 7, 7, 2], ['rect', 13, 4, 7, 7, 2], ['rect', 4, 13, 7, 7, 2], ['circle', 16.5, 16.5, 3.5]]);
export const BlocksIcon = make('BlocksIcon', [['rect', 3, 4, 18, 6, 2], ['rect', 3, 14, 8, 6, 2], ['rect', 14, 14, 7, 6, 2]]);
export const LayersIcon = make('LayersIcon', [p('M12 3l9 5-9 5-9-5z'), p('M3 13l9 5 9-5')]);
export const PackageIcon = make('PackageIcon', [p('M12 3l8 4.5v9L12 21l-8-4.5v-9z'), p('M4 7.5l8 4.5 8-4.5M12 12v9')]);
export const PaletteIcon = make('PaletteIcon', [p('M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2.2-.5-1.2.3-2.3 1.7-2.3H17a4 4 0 0 0 4-4 9 9 0 0 0-9-9z'), ['circle', 7.5, 11, 0.6], ['circle', 10, 7, 0.6], ['circle', 15, 7, 0.6]]);
export const BookIcon = make('BookIcon', [p('M5 5.5A1.5 1.5 0 0 1 6.5 4H19v13H6.5A1.5 1.5 0 0 0 5 18.5z'), p('M5 18.5A1.5 1.5 0 0 0 6.5 20H19v-3')]);
export const CommandKeyIcon = make('CommandKeyIcon', [p('M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z')]);
export const MonitorIcon = make('MonitorIcon', [['rect', 3, 4, 18, 12, 2], p('M9 20h6M12 16v4')]);
export const TabletIcon = make('TabletIcon', [['rect', 5, 3, 14, 18, 2.5], p('M11 18h2')]);
export const PhoneIcon = make('PhoneIcon', [['rect', 7, 3, 10, 18, 2.5], p('M11 18h2')]);
export const UploadIcon = make('UploadIcon', [p('M12 16V4M7 9l5-5 5 5'), p('M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3')]);

// Arrows and chevrons
export const ChevronLeftIcon = make('ChevronLeftIcon', [p('M15 6l-6 6 6 6')]);
export const ChevronDownIcon = make('ChevronDownIcon', [p('M6 9l6 6 6-6')]);
export const ChevronUpIcon = make('ChevronUpIcon', [p('M6 15l6-6 6 6')]);
export const ArrowLeftIcon = make('ArrowLeftIcon', [p('M19 12H5M11 6l-6 6 6 6')]);
export const ArrowUpIcon = make('ArrowUpIcon', [p('M12 19V5M6 11l6-6 6 6')]);
export const ArrowDownIcon = make('ArrowDownIcon', [p('M12 5v14M6 13l6 6 6-6')]);
export const SortIcon = make('SortIcon', [p('M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4')]);
export const MinusIcon = make('MinusIcon', [p('M5 12h14')]);
export const MoreIcon = make('MoreIcon', [['circle', 5, 12, 1], ['circle', 12, 12, 1], ['circle', 19, 12, 1]]);
export const RefreshIcon = make('RefreshIcon', [p('M20 11a8 8 0 0 0-14-4L4 9M4 4v5h5'), p('M4 13a8 8 0 0 0 14 4l2-2M20 20v-5h-5')]);

// Status
export const InfoIcon = make('InfoIcon', [['circle', 12, 12, 9], p('M12 11v5M12 8v.01')]);
export const AlertIcon = make('AlertIcon', [p('M12 4l9 16H3z'), p('M12 10v4M12 17v.01')]);
export const AlertCircleIcon = make('AlertCircleIcon', [['circle', 12, 12, 9], p('M12 7v6M12 16.5v.01')]);
export const CheckCircleIcon = make('CheckCircleIcon', [['circle', 12, 12, 9], p('M8 12.5l3 3 5-6')]);
export const XCircleIcon = make('XCircleIcon', [['circle', 12, 12, 9], p('M9 9l6 6M15 9l-6 6')]);
export const LoaderIcon = make('LoaderIcon', [p('M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8')]);
export const ShieldIcon = make('ShieldIcon', [p('M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z'), p('M9 12l2 2 4-4')]);

// People and communication
export const UserIcon = make('UserIcon', [['circle', 12, 8, 4], p('M4 20a8 8 0 0 1 16 0')]);
export const UsersIcon = make('UsersIcon', [['circle', 9, 8, 3.5], p('M2.5 19a6.5 6.5 0 0 1 13 0'), ['circle', 17, 9, 2.5], p('M17 14a5 5 0 0 1 4.5 5')]);
export const MailIcon = make('MailIcon', [['rect', 3, 5, 18, 14, 2.5], p('M3.5 7l8.5 6 8.5-6')]);
export const BellIcon = make('BellIcon', [p('M6 17v-6a6 6 0 0 1 12 0v6l1.5 2h-15z'), p('M10 21h4')]);

// Objects
export const CalendarIcon = make('CalendarIcon', [['rect', 3, 5, 18, 16, 2.5], p('M3 10h18M8 3v4M16 3v4')]);
export const ClockIcon = make('ClockIcon', [['circle', 12, 12, 9], p('M12 7v5l3 2')]);
export const HomeIcon = make('HomeIcon', [p('M4 11l8-7 8 7'), p('M6 10v10h12V10M10 20v-5h4v5')]);
export const SettingsIcon = make('SettingsIcon', [p('M4 7h10M18 7h2M4 17h2M10 17h10'), ['circle', 16, 7, 2], ['circle', 8, 17, 2]]);
export const LockIcon = make('LockIcon', [['rect', 5, 11, 14, 9, 2.5], p('M8 11V8a4 4 0 0 1 8 0v3')]);
export const GlobeIcon = make('GlobeIcon', [['circle', 12, 12, 9], p('M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18')]);
export const StarIcon = make('StarIcon', [p('M12 3.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.8l6-.8z')]);
export const HeartIcon = make('HeartIcon', [p('M12 20s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.2-8 11-8 11z')]);
export const BookmarkIcon = make('BookmarkIcon', [p('M6 4h12v17l-6-4-6 4z')]);

// Actions
export const EditIcon = make('EditIcon', [p('M4 20l1-4L16 5a2 2 0 0 1 3 3L8 19z'), p('M14 7l3 3')]);
export const TrashIcon = make('TrashIcon', [p('M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5')]);
export const DownloadIcon = make('DownloadIcon', [p('M12 4v12M7 11l5 5 5-5M4 20h16')]);
export const FilterIcon = make('FilterIcon', [p('M4 5h16l-6 8v6l-4-2v-4z')]);
export const EyeIcon = make('EyeIcon', [p('M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z'), ['circle', 12, 12, 3]]);
export const EyeOffIcon = make('EyeOffIcon', [p('M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z'), ['circle', 12, 12, 3], p('M4 4l16 16')]);
export const LinkIcon = make('LinkIcon', [p('M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1'), p('M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1')]);
export const ExternalLinkIcon = make('ExternalLinkIcon', [p('M14 4h6v6M20 4l-9 9'), p('M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5')]);
export const LogOutIcon = make('LogOutIcon', [p('M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3'), p('M16 12H6M9 8l-4 4 4 4')]);
export const ListIcon = make('ListIcon', [p('M9 6h11M9 12h11M9 18h11M4.5 6v.01M4.5 12v.01M4.5 18v.01')]);

// Content and media
export const FileIcon = make('FileIcon', [p('M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z'), p('M14 3v5h5')]);
export const FolderIcon = make('FolderIcon', [p('M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z')]);
export const ImageIcon = make('ImageIcon', [['rect', 3, 4, 18, 16, 2.5], ['circle', 9, 10, 1.8], p('M4 18l5-5 4 4 3-3 4 4')]);
export const PlayIcon = make('PlayIcon', [p('M8 5l11 7-11 7z')]);
export const PauseIcon = make('PauseIcon', [p('M8 5v14M16 5v14')]);
export const BarChartIcon = make('BarChartIcon', [p('M5 20v-9M12 20V5M19 20v-7')]);
export const TrendingIcon = make('TrendingIcon', [p('M3 17l6-6 4 4 8-8M15 7h6v6')]);
export const CodeIcon = make('CodeIcon', [p('M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16')]);
export const TerminalIcon = make('TerminalIcon', [['rect', 3, 4, 18, 16, 2.5], p('M7 9l3 3-3 3M13 15h4')]);


/** Everything above by name, for galleries and pickers. */
export const ArchiveIcon = make('ArchiveIcon', [['rect', 3, 4, 18, 4, 1], p('M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 12h4')]);
export const CakeIcon = make('CakeIcon', [p('M4 20h16M5 20v-7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v7M12 12V8M12 5.5v.01M5 16c2 1.5 3.5 1.5 5 0s3.5-1.5 5 0 2.5 1.2 4 .3')]);
export const CreditCardIcon = make('CreditCardIcon', [['rect', 2, 5, 20, 14, 2.5], p('M2 10h20M6 15h3')]);
export const FolderInputIcon = make('FolderInputIcon', [p('M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 13h6M12.5 10.5L15 13l-2.5 2.5')]);
export const GitMergeIcon = make('GitMergeIcon', [['circle', 6, 5, 2], ['circle', 6, 19, 2], ['circle', 18, 12, 2], p('M6 7v10M8 5c6 0 10 2 10 5')]);
export const InboxIcon = make('InboxIcon', [p('M3 13l3-8h12l3 8v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 13h5l1 3h6l1-3h5')]);
export const IndianRupeeIcon = make('IndianRupeeIcon', [p('M7 5h10M7 9.5h10M8 5c4.5 0 6.5 1.5 6.5 4.5S12.5 14 8 14l7 6')]);
export const LayoutDashboardIcon = make('LayoutDashboardIcon', [['rect', 3, 3, 7, 9, 1.5], ['rect', 14, 3, 7, 5, 1.5], ['rect', 14, 12, 7, 9, 1.5], ['rect', 3, 16, 7, 5, 1.5]]);
export const LayoutGridIcon = make('LayoutGridIcon', [['rect', 3, 3, 7, 7, 1.5], ['rect', 14, 3, 7, 7, 1.5], ['rect', 3, 14, 7, 7, 1.5], ['rect', 14, 14, 7, 7, 1.5]]);
export const MegaphoneIcon = make('MegaphoneIcon', [p('M4 10v4a1 1 0 0 0 1 1h2l8 4V5L7 9H5a1 1 0 0 0-1 1zM18 9a4 4 0 0 1 0 6')]);
export const MessageSquareIcon = make('MessageSquareIcon', [p('M5 4h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7l-5 4v-4H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z')]);
export const MousePointerClickIcon = make('MousePointerClickIcon', [p('M9 9l5 12 2-5 5-2zM5 3.5L6 6M3.5 8L6 8.5M8 3l-.5 2.5')]);
export const PanelLeftIcon = make('PanelLeftIcon', [['rect', 3, 4, 18, 16, 2.5], p('M9 4v16')]);
export const SaveIcon = make('SaveIcon', [p('M5 4h11l3 3v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM8 4v5h7V4M8 20v-6h8v6')]);
export const Share2Icon = make('Share2Icon', [['circle', 18, 5, 2.5], ['circle', 6, 12, 2.5], ['circle', 18, 19, 2.5], p('M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6')]);
export const TargetIcon = make('TargetIcon', [['circle', 12, 12, 9], ['circle', 12, 12, 5], ['circle', 12, 12, 1]]);
export const UserCircleIcon = make('UserCircleIcon', [['circle', 12, 12, 9], ['circle', 12, 10, 3], p('M6.5 18.5c1.5-2.5 3.2-3.5 5.5-3.5s4 1 5.5 3.5')]);
export const UserMinusIcon = make('UserMinusIcon', [['circle', 9, 8, 3.5], p('M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M17 11h5')]);
export const UserPlusIcon = make('UserPlusIcon', [['circle', 9, 8, 3.5], p('M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M19.5 8.5v5M17 11h5')]);
export const WalletIcon = make('WalletIcon', [p('M4 7a2 2 0 0 1 2-2h12v4M4 7v10a2 2 0 0 0 2 2h14V9H6a2 2 0 0 1-2-2zM16 14h.01')]);
export const ArrowUpRightIcon = make('ArrowUpRightIcon', [p('M7 17L17 7M8 7h9v9')]);
export const ArrowDownRightIcon = make('ArrowDownRightIcon', [p('M7 7l10 10M17 8v9H8')]);

export const PrinterIcon = make('PrinterIcon', [p('M7 9V4h10v5M7 17H5a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2M7 14h10v6H7z')]);
export const CallIcon = make('CallIcon', [p('M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z')]);
export const MapPinIcon = make('MapPinIcon', [p('M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z'), ['circle', 12, 10, 2.5]]);
export const CameraIcon = make('CameraIcon', [p('M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z'), ['circle', 12, 13, 3.5]]);
export const MicIcon = make('MicIcon', [['rect', 9, 3, 6, 11, 3], p('M5 11a7 7 0 0 0 14 0M12 18v3')]);
export const VideoIcon = make('VideoIcon', [['rect', 3, 6, 13, 12, 2], p('M16 10l5-3v10l-5-3')]);
export const WifiIcon = make('WifiIcon', [p('M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5v.01')]);
export const BatteryIcon = make('BatteryIcon', [['rect', 2, 8, 17, 9, 2], p('M22 11v3M6 11v3')]);
export const BluetoothIcon = make('BluetoothIcon', [p('M7 7l10 10-5 4V3l5 4L7 17')]);
export const ShareIcon = make('ShareIcon', [p('M12 15V4M8 8l4-4 4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5')]);
export const SendIcon = make('SendIcon', [p('M21 3L10 14M21 3l-7 18-4-7-7-4z')]);
export const PaperclipIcon = make('PaperclipIcon', [p('M20 11l-8.5 8.5a5 5 0 0 1-7-7L13 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L14 7')]);
export const TagIcon = make('TagIcon', [p('M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z'), ['circle', 7.5, 7.5, 1.2]]);
export const FlagIcon = make('FlagIcon', [p('M5 21V4M5 4h11l-2 4 2 4H5')]);
export const PinIcon = make('PinIcon', [p('M9 4h6l-1 6 3 3H7l3-3zM12 13v8')]);
export const ThumbsUpIcon = make('ThumbsUpIcon', [p('M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 2.5 2.4L13 10h5.5a2 2 0 0 1 2 2.4l-1.3 6A2 2 0 0 1 17.3 20H7')]);
export const SmileIcon = make('SmileIcon', [['circle', 12, 12, 9], p('M8.5 14a4 4 0 0 0 7 0M9 9.5v.01M15 9.5v.01')]);
export const KeyIcon = make('KeyIcon', [['circle', 8, 15, 4], p('M11 12l9-9M16 7l3 3')]);
export const UnlockIcon = make('UnlockIcon', [['rect', 5, 11, 14, 10, 2], p('M8 11V7a4 4 0 0 1 7.5-2')]);
export const TableIcon = make('TableIcon', [['rect', 3, 4, 18, 16, 2], p('M3 10h18M3 15h18M9 4v16')]);
export const DatabaseIcon = make('DatabaseIcon', [p('M4 6c0 1.7 3.6 3 8 3s8-1.3 8-3-3.6-3-8-3-8 1.3-8 3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3')]);
export const ServerIcon = make('ServerIcon', [['rect', 3, 4, 18, 7, 2], ['rect', 3, 13, 18, 7, 2], p('M7 7.5v.01M7 16.5v.01')]);
export const CloudIcon = make('CloudIcon', [p('M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 8.5z')]);
export const CloudUploadIcon = make('CloudUploadIcon', [p('M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 8.5M12 17v-6M9.5 13.5L12 11l2.5 2.5')]);
export const PieChartIcon = make('PieChartIcon', [p('M12 3v9h9A9 9 0 0 0 12 3zM10 5a8 8 0 1 0 9 9')]);
export const LineChartIcon = make('LineChartIcon', [p('M3 3v17a1 1 0 0 0 1 1h17M7 15l4-5 3 3 5-6')]);
export const ActivityIcon = make('ActivityIcon', [p('M3 12h4l3-8 4 16 3-8h4')]);
export const PercentIcon = make('PercentIcon', [p('M19 5L5 19'), ['circle', 7, 7, 2], ['circle', 17, 17, 2]]);
export const CalculatorIcon = make('CalculatorIcon', [['rect', 5, 3, 14, 18, 2], p('M8 7h8M8 12v.01M12 12v.01M16 12v.01M8 16v.01M12 16v.01M16 16v.01')]);
export const ReceiptIcon = make('ReceiptIcon', [p('M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6')]);
export const TruckIcon = make('TruckIcon', [p('M3 6h11v10H3zM14 9h4l3 3v4h-7'), ['circle', 7, 18, 2], ['circle', 17, 18, 2]]);
export const ShoppingCartIcon = make('ShoppingCartIcon', [p('M3 4h2l2.5 11h10l2-8H6.5'), ['circle', 9, 19, 1.5], ['circle', 17, 19, 1.5]]);
export const ShoppingBagIcon = make('ShoppingBagIcon', [p('M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2')]);
export const GiftIcon = make('GiftIcon', [['rect', 3, 8, 18, 4, 1], p('M5 12v8h14v-8M12 8v12M12 8c-2 0-4-1-4-3a2 2 0 0 1 4 0zM12 8c2 0 4-1 4-3a2 2 0 0 0-4 0')]);
export const BriefcaseIcon = make('BriefcaseIcon', [['rect', 3, 7, 18, 13, 2], p('M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18')]);
export const BuildingIcon = make('BuildingIcon', [['rect', 5, 3, 14, 18, 1], p('M9 8h.01M13 8h.01M9 12h.01M13 12h.01M10 21v-4h4v4')]);
export const GraduationCapIcon = make('GraduationCapIcon', [p('M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5M22 9v6')]);
export const AwardIcon = make('AwardIcon', [['circle', 12, 9, 6], p('M8.5 14L7 21l5-3 5 3-1.5-7')]);
export const TrophyIcon = make('TrophyIcon', [p('M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 14v4M8 21h8M10 18h4')]);
export const RocketIcon = make('RocketIcon', [p('M14 5c4-2 6-2 7-2 0 1 0 3-2 7l-6 6-5-5zM9 12L5 11l3-3 4 1M12 15l1 4 3-3-1-4M5 15c-1 1-2 4-2 6 2 0 5-1 6-2')]);
export const LightbulbIcon = make('LightbulbIcon', [p('M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z')]);
export const FlameIcon = make('FlameIcon', [p('M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-9z')]);
export const DropletIcon = make('DropletIcon', [p('M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z')]);
export const LeafIcon = make('LeafIcon', [p('M5 19c0-9 5-14 15-14 0 10-5 15-14 15M5 19l8-8')]);
export const MoreVerticalIcon = make('MoreVerticalIcon', [['circle', 12, 5, 1], ['circle', 12, 12, 1], ['circle', 12, 19, 1]]);
export const GripIcon = make('GripIcon', [['circle', 9, 6, 1.2], ['circle', 15, 6, 1.2], ['circle', 9, 12, 1.2], ['circle', 15, 12, 1.2], ['circle', 9, 18, 1.2], ['circle', 15, 18, 1.2]]);
export const MaximizeIcon = make('MaximizeIcon', [p('M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5')]);
export const MinimizeIcon = make('MinimizeIcon', [p('M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5')]);
export const ZoomInIcon = make('ZoomInIcon', [['circle', 11, 11, 6], p('M20 20l-4.5-4.5M11 8.5v5M8.5 11h5')]);
export const ZoomOutIcon = make('ZoomOutIcon', [['circle', 11, 11, 6], p('M20 20l-4.5-4.5M8.5 11h5')]);
export const UndoIcon = make('UndoIcon', [p('M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3')]);
export const RedoIcon = make('RedoIcon', [p('M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3')]);
export const BoldIcon = make('BoldIcon', [p('M7 4h6a3.5 3.5 0 0 1 0 7H7zM7 11h7a3.5 3.5 0 0 1 0 7H7z')]);
export const ItalicIcon = make('ItalicIcon', [p('M10 4h8M6 20h8M14 4l-4 16')]);
export const UnderlineIcon = make('UnderlineIcon', [p('M7 4v7a5 5 0 0 0 10 0V4M5 21h14')]);
export const AlignLeftIcon = make('AlignLeftIcon', [p('M4 6h16M4 10h10M4 14h16M4 18h10')]);
export const AlignCenterIcon = make('AlignCenterIcon', [p('M4 6h16M7 10h10M4 14h16M7 18h10')]);
export const QuoteIcon = make('QuoteIcon', [p('M5 17c2 0 3-1 3-3H5V8h5v6c0 3-2 5-5 5zM14 17c2 0 3-1 3-3h-3V8h5v6c0 3-2 5-5 5z')]);
export const HashIcon = make('HashIcon', [p('M5 9h15M4 15h15M10 3L8 21M16 3l-2 18')]);
export const AtSignIcon = make('AtSignIcon', [['circle', 12, 12, 4], p('M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1')]);
export const GitBranchIcon = make('GitBranchIcon', [['circle', 6, 5, 2], ['circle', 6, 19, 2], ['circle', 18, 8, 2], p('M6 7v10M18 10c0 4-6 3-12 6')]);
export const HelpCircleIcon = make('HelpCircleIcon', [['circle', 12, 12, 9], p('M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.7M12 17v.01')]);
export const ShieldCheckIcon = make('ShieldCheckIcon', [p('M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4')]);
export const BanIcon = make('BanIcon', [['circle', 12, 12, 9], p('M5.6 5.6l12.8 12.8')]);
export const LifeBuoyIcon = make('LifeBuoyIcon', [['circle', 12, 12, 9], ['circle', 12, 12, 3.5], p('M5.6 5.6l3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9')]);
export const PowerIcon = make('PowerIcon', [p('M12 3v8M6.5 6.5a8 8 0 1 0 11 0')]);
export const TimerIcon = make('TimerIcon', [['circle', 12, 13, 8], p('M12 9v4l2 2M9 3h6')]);
export const HourglassIcon = make('HourglassIcon', [p('M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9')]);
export const CompassIcon = make('CompassIcon', [['circle', 12, 12, 9], p('M15.5 8.5l-2 5-5 2 2-5z')]);
export const MapIcon = make('MapIcon', [p('M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2zM9 4v14M15 6v14')]);
export const NavigationIcon = make('NavigationIcon', [p('M4 11l16-7-7 16-2-7z')]);
export const BoxIcon = make('BoxIcon', [p('M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5L12 12l8-4.5M12 12v9')]);
export const CornerDownRightIcon = make('CornerDownRightIcon', [p('M5 5v6a3 3 0 0 0 3 3h11M15 10l4 4-4 4')]);
export const ChevronsLeftIcon = make('ChevronsLeftIcon', [p('M11 6l-6 6 6 6M19 6l-6 6 6 6')]);
export const ChevronsRightIcon = make('ChevronsRightIcon', [p('M13 6l6 6-6 6M5 6l6 6-6 6')]);
export const PlusCircleIcon = make('PlusCircleIcon', [['circle', 12, 12, 9], p('M12 8v8M8 12h8')]);
export const MinusCircleIcon = make('MinusCircleIcon', [['circle', 12, 12, 9], p('M8 12h8')]);
export const UserCheckIcon = make('UserCheckIcon', [['circle', 9, 8, 3.5], p('M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 11l2 2 4-4')]);
export const FileTextIcon = make('FileTextIcon', [p('M6 3h8l5 5v13H6zM14 3v5h5M9 13h6M9 17h6')]);
export const FileSpreadsheetIcon = make('FileSpreadsheetIcon', [p('M6 3h8l5 5v13H6zM14 3v5h5M9 12h6M9 16h6M12 11v8')]);
export const FolderPlusIcon = make('FolderPlusIcon', [p('M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM12 11v6M9 14h6')]);
export const FolderOpenIcon = make('FolderOpenIcon', [p('M3 8V6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v2M3 8h18l-2 10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z')]);
export const KanbanIcon = make('KanbanIcon', [['rect', 3, 4, 5, 12, 1.5], ['rect', 9.5, 4, 5, 16, 1.5], ['rect', 16, 4, 5, 8, 1.5]]);
export const PanelRightIcon = make('PanelRightIcon', [['rect', 3, 4, 18, 16, 2.5], p('M15 4v16')]);
export const ColumnsIcon = make('ColumnsIcon', [['rect', 3, 4, 18, 16, 2], p('M12 4v16')]);
export const TextIcon = make('TextIcon', [p('M5 6V5h14v1M12 5v14M9 19h6')]);
export const ClipboardIcon = make('ClipboardIcon', [['rect', 6, 5, 12, 16, 2], p('M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M9 12h6M9 16h4')]);
export const ClipboardCheckIcon = make('ClipboardCheckIcon', [['rect', 6, 5, 12, 16, 2], p('M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M9 14l2 2 4-4')]);
export const CheckSquareIcon = make('CheckSquareIcon', [['rect', 4, 4, 16, 16, 3], p('M8.5 12l2.5 2.5 4.5-5')]);
export const SquareIcon = make('SquareIcon', [['rect', 4, 4, 16, 16, 3]]);
export const CircleIcon = make('CircleIcon', [['circle', 12, 12, 9]]);
export const VolumeIcon = make('VolumeIcon', [p('M4 10v4h3l5 4V6L7 10zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11')]);
export const VolumeOffIcon = make('VolumeOffIcon', [p('M4 10v4h3l5 4V6L7 10zM16 9l5 6M21 9l-5 6')]);
export const SkipForwardIcon = make('SkipForwardIcon', [p('M5 4l10 8-10 8zM19 5v14')]);
export const SkipBackIcon = make('SkipBackIcon', [p('M19 4L9 12l10 8zM5 5v14')]);

// More arrows, files, finance, devices, status and layout
export const ChevronsUpDownIcon = make('ChevronsUpDownIcon', [p('M7 15l5 5 5-5M7 9l5-5 5 5')]);
export const ArrowUpLeftIcon = make('ArrowUpLeftIcon', [p('M17 17L7 7M7 16V7h9')]);
export const ArrowDownLeftIcon = make('ArrowDownLeftIcon', [p('M17 7L7 17M16 17H7V8')]);
export const ReplyIcon = make('ReplyIcon', [p('M9 17l-5-5 5-5M4 12h10a6 6 0 0 1 6 6v1')]);
export const ForwardIcon = make('ForwardIcon', [p('M15 17l5-5-5-5M20 12H10a6 6 0 0 0-6 6v1')]);
export const RepeatIcon = make('RepeatIcon', [p('M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3')]);
export const ShuffleIcon = make('ShuffleIcon', [p('M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5')]);
export const MoveIcon = make('MoveIcon', [p('M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3')]);
export const RotateCwIcon = make('RotateCwIcon', [p('M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5')]);
export const RotateCcwIcon = make('RotateCcwIcon', [p('M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5')]);
export const HistoryIcon = make('HistoryIcon', [p('M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2')]);
export const LogInIcon = make('LogInIcon', [p('M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l4 4-4 4M14 12H3')]);

export const SlidersIcon = make('SlidersIcon', [p('M4 7h9M17 7h3M4 17h3M11 17h9'), ['circle', 15, 7, 2], ['circle', 9, 17, 2]]);
export const ToggleIcon = make('ToggleIcon', [['rect', 2, 7, 20, 10, 5], ['circle', 16, 12, 2.5]]);
export const GaugeIcon = make('GaugeIcon', [p('M4 17a8 8 0 1 1 16 0M12 17l4-5')]);
export const ChartAreaIcon = make('ChartAreaIcon', [p('M3 3v18h18M7 15l4-5 3 3 5-6v9H7z')]);
export const BarChartHorizontalIcon = make('BarChartHorizontalIcon', [p('M4 4v16M4 7h10M4 12h14M4 17h7')]);
export const TrendingDownIcon = make('TrendingDownIcon', [p('M3 7l6 6 4-4 8 8M15 17h6v-6')]);
export const ListChecksIcon = make('ListChecksIcon', [p('M10 6h10M10 12h10M10 18h10M3.5 6l1.5 1.5L7.5 5M3.5 12l1.5 1.5 2.5-2.5M3.5 18l1.5 1.5 2.5-2.5')]);
export const LayoutListIcon = make('LayoutListIcon', [['rect', 3, 3, 18, 7, 2], ['rect', 3, 14, 18, 7, 2]]);
export const PanelTopIcon = make('PanelTopIcon', [['rect', 3, 4, 18, 16, 2], p('M3 9h18')]);
export const PanelBottomIcon = make('PanelBottomIcon', [['rect', 3, 4, 18, 16, 2], p('M3 15h18')]);
export const RowsIcon = make('RowsIcon', [['rect', 3, 4, 18, 16, 2], p('M3 12h18')]);
export const GridIcon = make('GridIcon', [['rect', 3, 3, 18, 18, 2], p('M3 9h18M3 15h18M9 3v18M15 3v18')]);
export const SidebarLeftIcon = make('SidebarLeftIcon', [['rect', 3, 4, 18, 16, 2], p('M9 4v16')]);
export const WorkflowIcon = make('WorkflowIcon', [['rect', 3, 3, 6, 6, 1.5], ['rect', 15, 15, 6, 6, 1.5], p('M6 9v3a3 3 0 0 0 3 3h6')]);
export const NetworkIcon = make('NetworkIcon', [['rect', 9, 3, 6, 6, 1], ['rect', 3, 15, 6, 6, 1], ['rect', 15, 15, 6, 6, 1], p('M12 9v3M6 15v-3h12v3')]);
export const DiamondIcon = make('DiamondIcon', [p('M12 3l9 9-9 9-9-9z')]);
export const TriangleIcon = make('TriangleIcon', [p('M12 4l9 16H3z')]);
export const HexagonIcon = make('HexagonIcon', [p('M12 3l8 4.5v9L12 21l-8-4.5v-9z')]);
export const CircleDotIcon = make('CircleDotIcon', [['circle', 12, 12, 9], ['circle', 12, 12, 3]]);
export const AsteriskIcon = make('AsteriskIcon', [p('M12 4v16M5 8l14 8M19 8L5 16')]);

export const BellOffIcon = make('BellOffIcon', [p('M9.5 5.5A6 6 0 0 1 18 11c0 3 1 5 2 6M6 8c0 4-1 7-2 9h11M10 20a2 2 0 0 0 4 0M3 3l18 18')]);
export const BellRingIcon = make('BellRingIcon', [p('M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15zM10 21h4M3 8a8 8 0 0 1 2.5-4.5M21 8a8 8 0 0 0-2.5-4.5')]);
export const MailOpenIcon = make('MailOpenIcon', [p('M3 10l9-6 9 6v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 10l9 6 9-6')]);
export const MessageCircleIcon = make('MessageCircleIcon', [p('M20 12a8 8 0 0 1-11.7 7L4 20l1-4.2A8 8 0 1 1 20 12z')]);
export const IdCardIcon = make('IdCardIcon', [['rect', 3, 5, 18, 14, 2], ['circle', 9, 11, 2], p('M6.5 16c.5-1.5 1.5-2 2.5-2s2 .5 2.5 2M14 10h4M14 13h3')]);
export const UserXIcon = make('UserXIcon', [p('M15 20v-1a5 5 0 0 0-5-5H8a5 5 0 0 0-5 5v1M17 9l4 4M21 9l-4 4'), ['circle', 9, 7, 4]]);
export const BadgeCheckIcon = make('BadgeCheckIcon', [p('M12 3l2.4 1.8 3-.2.9 2.9 2.4 1.8-.9 2.8.9 2.8-2.4 1.8-.9 2.9-3-.2L12 21l-2.4-1.8-3 .2-.9-2.9-2.4-1.8.9-2.8-.9-2.8 2.4-1.8.9-2.9 3 .2z'), p('M8.5 12l2.5 2.5 4.5-5')]);
export const CrownIcon = make('CrownIcon', [p('M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z')]);
export const GemIcon = make('GemIcon', [p('M6 4h12l3 5-9 11L3 9zM3 9h18M9 4l-2 5 5 11 5-11-2-5')]);
export const MedalIcon = make('MedalIcon', [['circle', 12, 15, 5], p('M8.5 11L6 3h4l2 4 2-4h4l-2.5 8')]);
export const WandIcon = make('WandIcon', [p('M4 20l10-10M13 7l4 4M18 2.5l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1zM19 14.5l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z')]);
export const BotIcon = make('BotIcon', [['rect', 5, 8, 14, 11, 3], p('M12 4v4M9 13v.01M15 13v.01M3 13v2M21 13v2')]);
export const MehIcon = make('MehIcon', [['circle', 12, 12, 9], p('M8 15h8M9 9.5v.01M15 9.5v.01')]);
export const FrownIcon = make('FrownIcon', [['circle', 12, 12, 9], p('M8 16c1-1.2 2.4-2 4-2s3 .8 4 2M9 9.5v.01M15 9.5v.01')]);

export const BanknoteIcon = make('BanknoteIcon', [['rect', 2, 6, 20, 12, 2], ['circle', 12, 12, 3], p('M6 12h.01M18 12h.01')]);
export const CoinsIcon = make('CoinsIcon', [['circle', 9, 9, 6], p('M18.1 10.4A6 6 0 1 1 10.4 18')]);
export const DollarSignIcon = make('DollarSignIcon', [p('M12 3v18M16.5 7.5C16 6 14.5 5.5 12 5.5S7.5 6.5 7.5 8.5 9.5 11 12 11.5s4.5 1 4.5 3-2 3-4.5 3-4-.7-4.5-2.5')]);
export const LandmarkIcon = make('LandmarkIcon', [p('M3 10l9-6 9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18')]);
export const StoreIcon = make('StoreIcon', [p('M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9M10 20v-5h4v5')]);
export const TicketIcon = make('TicketIcon', [p('M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a3 3 0 0 0 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a3 3 0 0 0 0-6zM14 5v14')]);
export const WarehouseIcon = make('WarehouseIcon', [p('M3 21V9l9-5 9 5v12M7 21v-7h10v7M7 17.5h10')]);
export const Building2Icon = make('Building2Icon', [p('M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M3 21h18M10 7h.01M14 7h.01M10 11h.01M14 11h.01M10 15h4v6')]);
export const ScaleIcon = make('ScaleIcon', [p('M12 3v18M7 21h10M5 7h14M5 7l-3 8a3.5 3.5 0 0 0 6 0zM19 7l-3 8a3.5 3.5 0 0 0 6 0z')]);

export const FileCodeIcon = make('FileCodeIcon', [p('M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5M10 13l-2 2 2 2M14 13l2 2-2 2')]);
export const FilePlusIcon = make('FilePlusIcon', [p('M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5M12 12v6M9 15h6')]);
export const FileCheckIcon = make('FileCheckIcon', [p('M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5M9 15l2 2 4-4')]);
export const ClipboardListIcon = make('ClipboardListIcon', [p('M9 4h6v3H9zM8 5.5H6a1 1 0 0 0-1 1V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6.5a1 1 0 0 0-1-1h-2M9 12h6M9 16h4')]);
export const StickyNoteIcon = make('StickyNoteIcon', [p('M5 4h14a1 1 0 0 1 1 1v9l-6 6H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM14 20v-5a1 1 0 0 1 1-1h5')]);
export const NewspaperIcon = make('NewspaperIcon', [p('M5 4h12a1 1 0 0 1 1 1v15H6a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1zM18 9h2v9a2 2 0 0 1-2 2M8 8h6M8 12h6M8 16h4')]);
export const RssIcon = make('RssIcon', [p('M5 5a14 14 0 0 1 14 14M5 11a8 8 0 0 1 8 8'), ['circle', 6, 18, 1]]);
export const FilmIcon = make('FilmIcon', [['rect', 3, 4, 18, 16, 2], p('M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4')]);
export const MusicIcon = make('MusicIcon', [p('M9 18V5l11-2v13'), ['circle', 6, 18, 3], ['circle', 17, 16, 3]]);
export const HeadphonesIcon = make('HeadphonesIcon', [p('M4 15v-3a8 8 0 0 1 16 0v3'), ['rect', 3, 14, 4, 7, 1.5], ['rect', 17, 14, 4, 7, 1.5]]);

export const CpuIcon = make('CpuIcon', [['rect', 6, 6, 12, 12, 2], ['rect', 9, 9, 6, 6, 1], p('M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3')]);
export const HardDriveIcon = make('HardDriveIcon', [p('M3 14l3-8h12l3 8'), ['rect', 3, 14, 18, 6, 2], p('M7 17h.01')]);
export const LaptopIcon = make('LaptopIcon', [['rect', 5, 5, 14, 10, 1.5], p('M2 19h20')]);
export const PlugIcon = make('PlugIcon', [p('M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4')]);
export const CloudDownloadIcon = make('CloudDownloadIcon', [p('M7 18a4.5 4.5 0 0 1-.5-9 6 6 0 0 1 11.5 1.5A3.8 3.8 0 0 1 17.5 18M12 11v8M9 16l3 3 3-3')]);
export const WifiOffIcon = make('WifiOffIcon', [p('M2 8.8a15 15 0 0 1 4-2.3M10 5.2A15 15 0 0 1 22 8.8M5 12.9a10 10 0 0 1 5-2.7M14 10.2a10 10 0 0 1 5 2.7M8.5 16.4a5 5 0 0 1 7 0M12 20h.01M3 3l18 18')]);
export const ScanIcon = make('ScanIcon', [p('M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16')]);
export const QrCodeIcon = make('QrCodeIcon', [['rect', 4, 4, 6, 6, 1], ['rect', 14, 4, 6, 6, 1], ['rect', 4, 14, 6, 6, 1], p('M14 14h3v3M20 14v.01M14 20h.01M17 20h3v-3')]);
export const BugIcon = make('BugIcon', [p('M9 8a3 3 0 0 1 6 0v1H9zM8 9h8v6a4 4 0 0 1-8 0zM3 13h5M16 13h5M4 6l3 2M20 6l-3 2M4 20l3-2.5M20 20l-3-2.5')]);
export const FlaskIcon = make('FlaskIcon', [p('M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3M7.5 15h9')]);

export const ShieldAlertIcon = make('ShieldAlertIcon', [p('M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM12 8v5M12 16.5v.01')]);
export const OctagonAlertIcon = make('OctagonAlertIcon', [p('M8 3h8l5 5v8l-5 5H8l-5-5V8zM12 8v5M12 16.5v.01')]);
export const TriangleAlertIcon = make('TriangleAlertIcon', [p('M12 4l9.5 16h-19zM12 10v4.5M12 17.5v.01')]);

export const CalendarCheckIcon = make('CalendarCheckIcon', [['rect', 4, 5, 16, 16, 2], p('M4 10h16M8 3v4M16 3v4M9 15l2 2 4-4')]);
export const AlarmClockIcon = make('AlarmClockIcon', [['circle', 12, 13, 8], p('M12 9v4l2 2M4 4l3-1M20 4l-3-1')]);
export const ThermometerIcon = make('ThermometerIcon', [p('M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z')]);
export const CoffeeIcon = make('CoffeeIcon', [p('M4 9h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 3v3M12 3v3')]);
export const CarIcon = make('CarIcon', [p('M5 16v-4l2-5h10l2 5v4M3 16h18M7 16v2M17 16v2')]);
export const PillIcon = make('PillIcon', [p('M10.5 20.5a4.9 4.9 0 0 1-7-7l10-10a4.9 4.9 0 0 1 7 7zM8.5 8.5l7 7')]);

export const TypeIcon = make('TypeIcon', [p('M5 6V4h14v2M12 4v16M9 20h6')]);
export const StrikethroughIcon = make('StrikethroughIcon', [p('M5 12h14M16 6.5C15 5.5 13.5 5 12 5c-2.5 0-4 1.2-4 3 0 1.3.8 2.2 2 2.8M8 17.5c1 1 2.5 1.5 4 1.5 2.5 0 4-1.2 4-3 0-.5-.1-1-.4-1.4')]);
export const AlignRightIcon = make('AlignRightIcon', [p('M4 6h16M10 12h10M6 18h14')]);
export const TranslateIcon = make('TranslateIcon', [p('M4 5h8M8 3v2M6 5c0 4 3 7 6 8M11 5c0 3-3 6-7 8M13 20l4-9 4 9M14.5 17h5')]);
export const ContrastIcon = make('ContrastIcon', [['circle', 12, 12, 9], p('M12 3a9 9 0 0 1 0 18z')]);
export const ScissorsIcon = make('ScissorsIcon', [['circle', 6, 6, 3], ['circle', 6, 18, 3], p('M20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12')]);
export const CropIcon = make('CropIcon', [p('M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2')]);
export const RulerIcon = make('RulerIcon', [p('M3 16L16 3l5 5L8 21zM7 12l2 2M10 9l2 2M13 6l2 2')]);

export const StethoscopeIcon = make('StethoscopeIcon', [p('M6 3v5a4 4 0 0 0 8 0V3M5 3h2M13 3h2M10 12v3a5 5 0 0 0 10 0v-2'), ['circle', 20, 11, 2]]);
export const SyringeIcon = make('SyringeIcon', [p('M8.5 15.5l7-7 4 4-7 7zM8.5 15.5L3 21M16.5 7.5L20 4M17 3l4 4')]);
export const HeartPulseIcon = make('HeartPulseIcon', [p('M12 20s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.2-8 11-8 11z'), p('M3 12h4l2-3 3 6 2-3h7')]);
export const BrainIcon = make('BrainIcon', [p('M9.5 4a3 3 0 0 0-3 3v.5A3 3 0 0 0 4 10.5 3 3 0 0 0 5 13a3 3 0 0 0 1.5 5.5A3 3 0 0 0 12 19V5a3 3 0 0 0-2.5-1zM14.5 4a3 3 0 0 1 3 3v.5a3 3 0 0 1 2.5 3 3 3 0 0 1-1 2.5 3 3 0 0 1-1.5 5.5A3 3 0 0 1 12 19V5a3 3 0 0 1 2.5-1z')]);
export const BandageIcon = make('BandageIcon', [p('M10.5 20.5a4.9 4.9 0 0 1-7-7l10-10a4.9 4.9 0 0 1 7 7z'), p('M9.5 12l2.5 2.5M12 9.5l2.5 2.5')]);
export const DnaIcon = make('DnaIcon', [p('M7 3c0 4.5 10 4.5 10 9s-10 4.5-10 9'), p('M17 3c0 4.5-10 4.5-10 9s10 4.5 10 9'), p('M8.5 6.5h7M8.5 17.5h7')]);
export const MicroscopeIcon = make('MicroscopeIcon', [p('M8 3l4 2-3.5 7.5-4-2z'), p('M5.5 16.5h8M11 8.5a7.5 7.5 0 0 1 5 12M4 21h14')]);
export const AmbulanceIcon = make('AmbulanceIcon', [p('M3 15V7a1 1 0 0 1 1-1h10v9M14 9h4l3 3v3h-1.5M3 15h2M9 15h6'), ['circle', 7, 17, 2], ['circle', 17, 17, 2], p('M8.5 8v4M6.5 10h4')]);
export const HospitalIcon = make('HospitalIcon', [p('M4 21V6l8-3 8 3v15M2 21h20M12 8v5M9.5 10.5h5M10 21v-4h4v4')]);
export const ToothIcon = make('ToothIcon', [p('M7 3c-2 0-3.5 1.5-3.5 4 0 3 1.5 4 1.5 7 0 3 .5 7 2.5 7 2 0 1.5-5 4.5-5s2.5 5 4.5 5c2 0 2.5-4 2.5-7 0-3 1.5-4 1.5-7 0-2.5-1.5-4-3.5-4-2 0-3 1-5 1S9 3 7 3z')]);
export const MedicalCrossIcon = make('MedicalCrossIcon', [p('M9 3h6v6h6v6h-6v6H9v-6H3V9h6z')]);
export const BedIcon = make('BedIcon', [p('M3 20V5M3 15h18v5M21 15v-3a3 3 0 0 0-3-3h-7v6'), ['circle', 7, 11, 2]]);
export const EuroIcon = make('EuroIcon', [p('M17.5 6.5a6.5 6.5 0 1 0 0 11M4 10h9M4 14h9')]);
export const PoundIcon = make('PoundIcon', [p('M17 20H7c1.5-1.5 2-3 2-5.5V8a4 4 0 0 1 7.5-2M6 13h8')]);
export const YenIcon = make('YenIcon', [p('M6 4l6 8 6-8M12 12v8M8 14.5h8M8 17.5h8')]);
export const BitcoinIcon = make('BitcoinIcon', [p('M8 4v16M8 5h5.5a3 3 0 0 1 0 6H8M8 11h6a3 3 0 0 1 0 6H8M10.5 3v2M13.5 3v2M10.5 19v2M13.5 19v2')]);
export const PiggyBankIcon = make('PiggyBankIcon', [p('M18.5 9c1.5.4 2.5 1.5 2.5 3.5V15h-2l-1 3h-3v-1.5h-5V18H7l-1-3c-1.8-.6-3-2-3-3.5C3 8.5 6.5 6 10.5 6H15c.6-1.2 1.6-2 3-2z'), ['circle', 16, 10.5, 0.5], p('M9 3.5h3')]);
export const SafeIcon = make('SafeIcon', [['rect', 3, 4, 18, 16, 2], ['circle', 12, 12, 3.5], p('M12 8.5V7M12 17v-1.5M6 20v1.5M18 20v1.5')]);
export const HandshakeIcon = make('HandshakeIcon', [['rect', 2, 7, 3, 9, 0.8], ['rect', 19, 7, 3, 9, 0.8], p('M5 9l4-2 2 1.5 2-1.5 4 2M5 15l3.5 3 2.5-1.5 2 1 2.5-1 3.5-2.5'), p('M9 13l2 2M11.5 12l2 2M14 11.5l1.5 1.5')]);
export const InvoiceIcon = make('InvoiceIcon', [p('M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8zM14 3v5h5'), p('M12 11v7M14 12.2c-.3-.5-1-.7-2-.7-1.2 0-2 .6-2 1.5S10.8 14 12 14s2 .6 2 1.5-.8 1.5-2 1.5c-1 0-1.7-.3-2-.8')]);
export const ScatterChartIcon = make('ScatterChartIcon', [p('M3 3v18h18'), ['circle', 8, 14, 1], ['circle', 12, 9, 1], ['circle', 16, 15, 1], ['circle', 18, 8, 1]]);
export const FunnelIcon = make('FunnelIcon', [p('M3 4h18l-7 8v6l-4 2v-8z')]);
export const SigmaIcon = make('SigmaIcon', [p('M18 5H6l7 7-7 7h12')]);
export const RadarChartIcon = make('RadarChartIcon', [p('M12 3l8.5 6.2-3.2 10H6.7L3.5 9.2z'), p('M12 12V3M12 12l8.5-2.8M12 12l-8.5-2.8M12 12l5.3 7M12 12l-5.3 7')]);
export const CandlestickChartIcon = make('CandlestickChartIcon', [['rect', 5, 8, 4, 7, 0.5], p('M7 5v3M7 15v4'), ['rect', 15, 6, 4, 8, 0.5], p('M17 3v3M17 14v5')]);
export const DonutChartIcon = make('DonutChartIcon', [['circle', 12, 12, 9], ['circle', 12, 12, 4], p('M12 3v5M20.5 8.9l-4.7 1.7')]);
export const StackedBarIcon = make('StackedBarIcon', [['rect', 4, 4, 6, 16, 1], ['rect', 14, 9, 6, 11, 1], p('M4 12h6M14 15h6')]);
export const HistogramIcon = make('HistogramIcon', [p('M4 20v-5h4v5M8 20V9h4v11M12 20V4h4v16M16 20v-8h4v8M3 20h18')]);

export const CloudRainIcon = make('CloudRainIcon', [p('M8.25 14a3.4 3.4 0 0 1-.45-6.72A4.5 4.5 0 0 1 16.5 7.6a3 3 0 0 1-.4 6.4z'), p('M8 17l-1 3M12 17l-1 3M16 17l-1 3')]);
export const CloudSnowIcon = make('CloudSnowIcon', [p('M8.25 14a3.4 3.4 0 0 1-.45-6.72A4.5 4.5 0 0 1 16.5 7.6a3 3 0 0 1-.4 6.4z'), p('M8 17h.01M8 20.5h.01M12 18.5h.01M12 22h.01M16 17h.01M16 20.5h.01')]);
export const CloudLightningIcon = make('CloudLightningIcon', [p('M8.25 14a3.4 3.4 0 0 1-.45-6.72A4.5 4.5 0 0 1 16.5 7.6a3 3 0 0 1-.4 6.4z'), p('M13 14l-3 4h4l-3 4')]);
export const CloudSunIcon = make('CloudSunIcon', [p('M10.25 19a3.4 3.4 0 0 1-.45-6.72A4.5 4.5 0 0 1 18.5 12.6a3 3 0 0 1-.4 6.4z'), ['circle', 8, 8, 2.5], p('M8 2.5V4M2.5 8H4M4 4l1 1M12 4l-1 1')]);
export const CloudFogIcon = make('CloudFogIcon', [p('M8.25 14a3.4 3.4 0 0 1-.45-6.72A4.5 4.5 0 0 1 16.5 7.6a3 3 0 0 1-.4 6.4z'), p('M4 17h16M7 20.5h10')]);
export const WindIcon = make('WindIcon', [p('M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h7a2.5 2.5 0 1 1-2.5 2.5')]);
export const SunriseIcon = make('SunriseIcon', [p('M3 20h18M7 20a5 5 0 0 1 10 0M12 4v6M9.5 6.5L12 4l2.5 2.5M5.2 13.2l1.4 1.4M18.8 13.2l-1.4 1.4')]);
export const SunsetIcon = make('SunsetIcon', [p('M3 20h18M7 20a5 5 0 0 1 10 0M12 4v6M9.5 7.5L12 10l2.5-2.5M5.2 13.2l1.4 1.4M18.8 13.2l-1.4 1.4')]);
export const UmbrellaIcon = make('UmbrellaIcon', [p('M3 12a9 9 0 0 1 18 0zM12 12v6a2 2 0 0 0 4 0M12 3V2')]);
export const SnowflakeIcon = make('SnowflakeIcon', [p('M12 2v20M3.3 7l17.4 10M3.3 17l17.4-10M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5')]);
export const BusIcon = make('BusIcon', [['rect', 4, 3, 16, 16, 2], p('M7 6.5h10V11H7zM6 19v2M18 19v2'), ['circle', 8, 15, 0.9], ['circle', 16, 15, 0.9]]);
export const TrainIcon = make('TrainIcon', [['rect', 5, 3, 14, 15, 3], p('M5 11h14M8 18l-2 3M16 18l2 3M9 6.5h6'), ['circle', 9, 14.5, 1], ['circle', 15, 14.5, 1]]);
export const BikeIcon = make('BikeIcon', [['circle', 6, 16, 3.5], ['circle', 18, 16, 3.5], p('M6 16l3.5-7h5.5l3 7M9.5 9L8 6.5h3M15 9l1.2-3h2.3M9.5 9l3 7')]);
export const ShipIcon = make('ShipIcon', [p('M2.5 15h19l-2.5 5H5zM6 15v-4h12v4M10 11V7h4v4M12 7V4')]);
export const PlaneIcon = make('PlaneIcon', [p('M12 2c1 0 1.5 1.5 1.5 3v5l8 5v2l-8-2.5V19l2.5 2v1.5L12 21.5 8 22.5V21l2.5-2v-4.5l-8 2.5v-2l8-5V5c0-1.5.5-3 1.5-3z')]);
export const FuelIcon = make('FuelIcon', [['rect', 4, 3, 10, 18, 1.5], p('M4 21h10M7 7h4v4H7zM14 8h2a2 2 0 0 1 2 2v7a1.5 1.5 0 0 0 3 0V9l-3-3')]);
export const ParkingIcon = make('ParkingIcon', [['rect', 3, 3, 18, 18, 3], p('M9 17V7h3.5a3 3 0 0 1 0 6H9')]);
export const AnchorIcon = make('AnchorIcon', [['circle', 12, 5, 2], p('M12 7v14M8 11h8M4 14a8 8 0 0 0 16 0M4 14h3M20 14h-3')]);
export const ScooterIcon = make('ScooterIcon', [['circle', 5, 18.5, 2], ['circle', 19, 18.5, 2], p('M7 18.5h10M17 18.5L15 5h3M15 5h-3')]);
export const RoadIcon = make('RoadIcon', [p('M8 3L3 21M16 3l5 18M12 4v3M12 10v4M12 17v3')]);

export const KeyboardIcon = make('KeyboardIcon', [['rect', 2, 6, 20, 12, 2], p('M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M9 14h6')]);
export const SignalBarsIcon = make('SignalBarsIcon', [p('M4 20v-3M9 20v-7M14 20v-11M19 20V4')]);
export const BatteryChargingIcon = make('BatteryChargingIcon', [['rect', 2, 7, 17, 10, 2], p('M22 11v2M10 8.5l-2 3.5h4l-2 3.5')]);
export const CastIcon = make('CastIcon', [p('M3 8V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-6M3 12a9 9 0 0 1 9 9M3 16a5 5 0 0 1 5 5M3 20h.01')]);
export const FingerprintIcon = make('FingerprintIcon', [p('M5 12a7 7 0 0 1 14 0c0 2.2-.3 4.2-.9 6M8 12.5a4 4 0 0 1 8 0c0 3-.5 5.5-1.5 8M12 12.5V14c0 2.5-.4 4.5-1.2 6.5M8 16.5c-.2 1.3-.5 2.5-1 3.5')]);

export const ArrowLeftRightIcon = make('ArrowLeftRightIcon', [p('M3 8h18M17 4l4 4-4 4M21 16H3M7 12l-4 4 4 4')]);
export const ArrowUpDownIcon = make('ArrowUpDownIcon', [p('M8 3v18M4 7l4-4 4 4M16 21V3M12 17l4 4 4-4')]);
export const ChevronsUpIcon = make('ChevronsUpIcon', [p('M7 11l5-5 5 5M7 18l5-5 5 5')]);
export const ChevronsDownIcon = make('ChevronsDownIcon', [p('M7 6l5 5 5-5M7 13l5 5 5-5')]);
export const CornerUpLeftIcon = make('CornerUpLeftIcon', [p('M9 14L4 9l5-5M20 20v-7a4 4 0 0 0-4-4H4')]);
export const CornerUpRightIcon = make('CornerUpRightIcon', [p('M15 14l5-5-5-5M4 20v-7a4 4 0 0 1 4-4h12')]);
export const CornerDownLeftIcon = make('CornerDownLeftIcon', [p('M9 10l-5 5 5 5M20 4v7a4 4 0 0 1-4 4H4')]);
export const ArrowDownToLineIcon = make('ArrowDownToLineIcon', [p('M12 3v13M7 11l5 5 5-5M5 21h14')]);
export const ArrowUpFromLineIcon = make('ArrowUpFromLineIcon', [p('M12 21V8M7 13l5-5 5 5M5 3h14')]);
export const PanelLeftCloseIcon = make('PanelLeftCloseIcon', [['rect', 3, 3, 18, 18, 2], p('M9 3v18M16 9l-3 3 3 3')]);
export const PanelLeftOpenIcon = make('PanelLeftOpenIcon', [['rect', 3, 3, 18, 18, 2], p('M9 3v18M13 9l3 3-3 3')]);
export const ExpandIcon = make('ExpandIcon', [p('M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7')]);
export const ShrinkIcon = make('ShrinkIcon', [p('M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7')]);
export const FullscreenIcon = make('FullscreenIcon', [p('M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2'), ['rect', 8, 8, 8, 8, 1]]);
export const SidebarRightIcon = make('SidebarRightIcon', [['rect', 3, 3, 18, 18, 2], p('M15 3v18')]);
export const LayoutTemplateIcon = make('LayoutTemplateIcon', [['rect', 3, 3, 18, 7, 1], ['rect', 3, 14, 8, 7, 1], ['rect', 15, 14, 6, 7, 1]]);
export const AlignJustifyIcon = make('AlignJustifyIcon', [p('M4 6h16M4 10h16M4 14h16M4 18h16')]);
export const ListOrderedIcon = make('ListOrderedIcon', [p('M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1')]);
export const Heading1Icon = make('Heading1Icon', [p('M4 5v14M12 5v14M4 12h8M17 9l3-2v12')]);
export const Heading2Icon = make('Heading2Icon', [p('M4 5v14M12 5v14M4 12h8M16 10a2 2 0 1 1 3.4 1.4L16 17h4.5')]);
export const Heading3Icon = make('Heading3Icon', [p('M4 5v14M12 5v14M4 12h8M15.5 9.2a2.25 2.25 0 0 1 4.5 0c0 1.5-1.5 2.4-2.25 2.4.75 0 2.25.9 2.25 2.4a2.25 2.25 0 0 1-4.5 0')]);
export const IndentIcon = make('IndentIcon', [p('M3 6h18M11 12h10M11 18h10M3 9l3 3-3 3')]);
export const OutdentIcon = make('OutdentIcon', [p('M3 6h18M11 12h10M11 18h10M6 9l-3 3 3 3')]);
export const HighlighterIcon = make('HighlighterIcon', [p('M13 4l7 7-7.5 7.5L5.5 11zM5.5 11L4 17l5-1.5M4 21h8')]);
export const PilcrowIcon = make('PilcrowIcon', [p('M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 0 0 0 9H13')]);
export const FileImageIcon = make('FileImageIcon', [p('M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M19 18l-3.5-3.5L9 20'), ['circle', 10, 12.5, 1.3]]);
export const FileVideoIcon = make('FileVideoIcon', [p('M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M10 12.5l4 2.5-4 2.5z')]);
export const FileAudioIcon = make('FileAudioIcon', [p('M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M10 18v-6l4-1v6'), ['circle', 9, 18, 1.2], ['circle', 13, 17, 1.2]]);
export const FileXIcon = make('FileXIcon', [p('M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9.5 12.5l5 5M14.5 12.5l-5 5')]);
export const FileDownIcon = make('FileDownIcon', [p('M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M12 12v6M9.5 15.5L12 18l2.5-2.5')]);
export const FileUpIcon = make('FileUpIcon', [p('M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M12 18v-6M9.5 14.5L12 12l2.5 2.5')]);
export const FileArchiveIcon = make('FileArchiveIcon', [p('M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M10 12h2M12 14h2M10 16h2M12 18h2')]);
export const FileJsonIcon = make('FileJsonIcon', [p('M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M10 13c-1 0-1 .5-1 1.5s-.5 1.5-1 1.5c.5 0 1 .5 1 1.5S9 19 10 19M14 13c1 0 1 .5 1 1.5s.5 1.5 1 1.5c-.5 0-1 .5-1 1.5S15 19 14 19')]);
export const BracesIcon = make('BracesIcon', [p('M8 3H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1M16 3h1a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-1')]);
export const BracketsIcon = make('BracketsIcon', [p('M8 3H5v18h3M16 3h3v18h-3')]);
export const WebhookIcon = make('WebhookIcon', [['circle', 12, 6, 2], ['circle', 6.5, 17, 2], ['circle', 17.5, 17, 2], p('M12 8v3l-4.5 4.5M12 11l4.5 4.5M8.5 17h7')]);
export const PuzzleIcon = make('PuzzleIcon', [p('M9.5 4a2 2 0 1 1 4 0V6H18a1 1 0 0 1 1 1v3.5h-1.5a2 2 0 1 0 0 4H19V19a1 1 0 0 1-1 1h-3.5v-1.5a2 2 0 1 0-4 0V20H7a1 1 0 0 1-1-1v-3.5H4.5a2 2 0 1 1 0-4H6V7a1 1 0 0 1 1-1h2.5z')]);
export const GitCommitIcon = make('GitCommitIcon', [['circle', 12, 12, 3.5], p('M3 12h5.5M15.5 12H21')]);
export const GitPullRequestIcon = make('GitPullRequestIcon', [['circle', 6, 6, 2.5], ['circle', 6, 18, 2.5], ['circle', 18, 18, 2.5], p('M6 8.5v7M18 15.5V10a4 4 0 0 0-4-4h-2M14.5 3.5L12 6l2.5 2.5')]);
export const GitForkIcon = make('GitForkIcon', [['circle', 6, 5, 2.5], ['circle', 18, 5, 2.5], ['circle', 12, 19, 2.5], p('M6 7.5V9a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7.5M12 12v4.5')]);
export const BinaryIcon = make('BinaryIcon', [p('M6 5l2-1v6'), ['rect', 14, 4, 4, 6, 2], ['rect', 6, 14, 4, 6, 2], p('M16 15l2-1v6')]);
export const UnlinkIcon = make('UnlinkIcon', [p('M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1'), p('M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'), p('M3 3l18 18')]);
export const PinOffIcon = make('PinOffIcon', [p('M9 3h6M10 3v6l-3 4h5M14 3v3M12 13v8M18 13h-3M3 3l18 18')]);
export const ThumbsDownIcon = make('ThumbsDownIcon', [p('M7 13v-9H4v9zM7 13l4 7a2 2 0 0 0 2.5-2.4L13 14h5.5a2 2 0 0 0 2-2.4l-1.3-6A2 2 0 0 0 17.3 4H7')]);
export const GripVerticalIcon = make('GripVerticalIcon', [p('M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01')]);
export const GripHorizontalIcon = make('GripHorizontalIcon', [p('M5 9h.01M12 9h.01M19 9h.01M5 15h.01M12 15h.01M19 15h.01')]);
export const ToggleRightIcon = make('ToggleRightIcon', [['rect', 2, 7, 20, 10, 5], ['circle', 16.5, 12, 2.5]]);
export const CrosshairIcon = make('CrosshairIcon', [['circle', 12, 12, 9], p('M12 3v4M12 17v4M3 12h4M17 12h4')]);
export const DotIcon = make('DotIcon', [['circle', 12, 12, 0.5]]);
export const EqualIcon = make('EqualIcon', [p('M5 9h14M5 15h14')]);
export const UserCogIcon = make('UserCogIcon', [['circle', 10, 8, 4], p('M3 21v-1a6 6 0 0 1 9-5.2M18 13.5v1.3M18 21.2v1.3M13.5 18h1.3M21.2 18h1.3'), ['circle', 18, 18, 2.2]]);
export const CalendarPlusIcon = make('CalendarPlusIcon', [['rect', 4, 5, 16, 16, 2], p('M4 10h16M8 3v4M16 3v4M12 13v5M9.5 15.5h5')]);
export const CalendarDaysIcon = make('CalendarDaysIcon', [['rect', 4, 5, 16, 16, 2], p('M4 10h16M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01')]);
export const CalendarXIcon = make('CalendarXIcon', [['rect', 4, 5, 16, 16, 2], p('M4 10h16M8 3v4M16 3v4M10 13.5l4 4M14 13.5l-4 4')]);
export const ReplyAllIcon = make('ReplyAllIcon', [p('M7 17L2 12l5-5M12 17l-5-5 5-5M22 18v-2a4 4 0 0 0-4-4H8')]);

export const icons = {
  PrinterIcon,
  CallIcon,
  MapPinIcon,
  CameraIcon,
  MicIcon,
  VideoIcon,
  WifiIcon,
  BatteryIcon,
  BluetoothIcon,
  ShareIcon,
  SendIcon,
  PaperclipIcon,
  TagIcon,
  FlagIcon,
  PinIcon,
  ThumbsUpIcon,
  SmileIcon,
  KeyIcon,
  UnlockIcon,
  TableIcon,
  DatabaseIcon,
  ServerIcon,
  CloudIcon,
  CloudUploadIcon,
  PieChartIcon,
  LineChartIcon,
  ActivityIcon,
  PercentIcon,
  CalculatorIcon,
  ReceiptIcon,
  TruckIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  GiftIcon,
  BriefcaseIcon,
  BuildingIcon,
  GraduationCapIcon,
  AwardIcon,
  TrophyIcon,
  RocketIcon,
  LightbulbIcon,
  FlameIcon,
  DropletIcon,
  LeafIcon,
  MoreVerticalIcon,
  GripIcon,
  MaximizeIcon,
  MinimizeIcon,
  ZoomInIcon,
  ZoomOutIcon,
  UndoIcon,
  RedoIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  QuoteIcon,
  HashIcon,
  AtSignIcon,
  GitBranchIcon,
  HelpCircleIcon,
  ShieldCheckIcon,
  BanIcon,
  LifeBuoyIcon,
  PowerIcon,
  TimerIcon,
  HourglassIcon,
  CompassIcon,
  MapIcon,
  NavigationIcon,
  BoxIcon,
  CornerDownRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  UserCheckIcon,
  FileTextIcon,
  FileSpreadsheetIcon,
  FolderPlusIcon,
  FolderOpenIcon,
  KanbanIcon,
  PanelRightIcon,
  ColumnsIcon,
  TextIcon,
  ClipboardIcon,
  ClipboardCheckIcon,
  CheckSquareIcon,
  SquareIcon,
  CircleIcon,
  VolumeIcon,
  VolumeOffIcon,
  SkipForwardIcon,
  SkipBackIcon,

  ArchiveIcon,
  CakeIcon,
  CreditCardIcon,
  FolderInputIcon,
  GitMergeIcon,
  InboxIcon,
  IndianRupeeIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  MegaphoneIcon,
  MessageSquareIcon,
  MousePointerClickIcon,
  PanelLeftIcon,
  SaveIcon,
  Share2Icon,
  TargetIcon,
  UserCircleIcon,
  UserMinusIcon,
  UserPlusIcon,
  WalletIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,

  BefMark,
  SearchIcon,
  CopyIcon,
  CheckIcon,
  XIcon,
  PlusIcon,
  MenuIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  SunIcon,
  MoonIcon,
  SparkleIcon,
  ZapIcon,
  ComponentsIcon,
  BlocksIcon,
  LayersIcon,
  PackageIcon,
  PaletteIcon,
  BookIcon,
  CommandKeyIcon,
  MonitorIcon,
  TabletIcon,
  PhoneIcon,
  UploadIcon,
  ChevronLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  SortIcon,
  MinusIcon,
  MoreIcon,
  RefreshIcon,
  InfoIcon,
  AlertIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  LoaderIcon,
  ShieldIcon,
  UserIcon,
  UsersIcon,
  MailIcon,
  BellIcon,
  CalendarIcon,
  ClockIcon,
  HomeIcon,
  SettingsIcon,
  LockIcon,
  GlobeIcon,
  StarIcon,
  HeartIcon,
  BookmarkIcon,
  EditIcon,
  TrashIcon,
  DownloadIcon,
  FilterIcon,
  EyeIcon,
  EyeOffIcon,
  LinkIcon,
  ExternalLinkIcon,
  LogOutIcon,
  ListIcon,
  FileIcon,
  FolderIcon,
  ImageIcon,
  PlayIcon,
  PauseIcon,
  BarChartIcon,
  TrendingIcon,
  CodeIcon,
  TerminalIcon,
  ChevronsUpDownIcon,
  ArrowUpLeftIcon,
  ArrowDownLeftIcon,
  ReplyIcon,
  ForwardIcon,
  RepeatIcon,
  ShuffleIcon,
  MoveIcon,
  RotateCwIcon,
  RotateCcwIcon,
  HistoryIcon,
  LogInIcon,
  SlidersIcon,
  ToggleIcon,
  GaugeIcon,
  ChartAreaIcon,
  BarChartHorizontalIcon,
  TrendingDownIcon,
  ListChecksIcon,
  LayoutListIcon,
  PanelTopIcon,
  PanelBottomIcon,
  RowsIcon,
  GridIcon,
  SidebarLeftIcon,
  WorkflowIcon,
  NetworkIcon,
  DiamondIcon,
  TriangleIcon,
  HexagonIcon,
  CircleDotIcon,
  AsteriskIcon,
  BellOffIcon,
  BellRingIcon,
  MailOpenIcon,
  MessageCircleIcon,
  IdCardIcon,
  UserXIcon,
  BadgeCheckIcon,
  CrownIcon,
  GemIcon,
  MedalIcon,
  WandIcon,
  BotIcon,
  MehIcon,
  FrownIcon,
  BanknoteIcon,
  CoinsIcon,
  DollarSignIcon,
  LandmarkIcon,
  StoreIcon,
  TicketIcon,
  WarehouseIcon,
  Building2Icon,
  ScaleIcon,
  FileCodeIcon,
  FilePlusIcon,
  FileCheckIcon,
  ClipboardListIcon,
  StickyNoteIcon,
  NewspaperIcon,
  RssIcon,
  FilmIcon,
  MusicIcon,
  HeadphonesIcon,
  CpuIcon,
  HardDriveIcon,
  LaptopIcon,
  PlugIcon,
  CloudDownloadIcon,
  WifiOffIcon,
  ScanIcon,
  QrCodeIcon,
  BugIcon,
  FlaskIcon,
  ShieldAlertIcon,
  OctagonAlertIcon,
  TriangleAlertIcon,
  CalendarCheckIcon,
  AlarmClockIcon,
  ThermometerIcon,
  CoffeeIcon,
  CarIcon,
  PillIcon,
  TypeIcon,
  StrikethroughIcon,
  AlignRightIcon,
  TranslateIcon,
  ContrastIcon,
  ScissorsIcon,
  CropIcon,
  RulerIcon,
  StethoscopeIcon,
  SyringeIcon,
  HeartPulseIcon,
  BrainIcon,
  BandageIcon,
  DnaIcon,
  MicroscopeIcon,
  AmbulanceIcon,
  HospitalIcon,
  ToothIcon,
  MedicalCrossIcon,
  BedIcon,
  EuroIcon,
  PoundIcon,
  YenIcon,
  BitcoinIcon,
  PiggyBankIcon,
  SafeIcon,
  HandshakeIcon,
  InvoiceIcon,
  ScatterChartIcon,
  FunnelIcon,
  SigmaIcon,
  RadarChartIcon,
  CandlestickChartIcon,
  DonutChartIcon,
  StackedBarIcon,
  HistogramIcon,
  CloudRainIcon,
  CloudSnowIcon,
  CloudLightningIcon,
  CloudSunIcon,
  CloudFogIcon,
  WindIcon,
  SunriseIcon,
  SunsetIcon,
  UmbrellaIcon,
  SnowflakeIcon,
  BusIcon,
  TrainIcon,
  BikeIcon,
  ShipIcon,
  PlaneIcon,
  FuelIcon,
  ParkingIcon,
  AnchorIcon,
  ScooterIcon,
  RoadIcon,
  KeyboardIcon,
  SignalBarsIcon,
  BatteryChargingIcon,
  CastIcon,
  FingerprintIcon,
  ArrowLeftRightIcon,
  ArrowUpDownIcon,
  ChevronsUpIcon,
  ChevronsDownIcon,
  CornerUpLeftIcon,
  CornerUpRightIcon,
  CornerDownLeftIcon,
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  ExpandIcon,
  ShrinkIcon,
  FullscreenIcon,
  SidebarRightIcon,
  LayoutTemplateIcon,
  AlignJustifyIcon,
  ListOrderedIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  IndentIcon,
  OutdentIcon,
  HighlighterIcon,
  PilcrowIcon,
  FileImageIcon,
  FileVideoIcon,
  FileAudioIcon,
  FileXIcon,
  FileDownIcon,
  FileUpIcon,
  FileArchiveIcon,
  FileJsonIcon,
  BracesIcon,
  BracketsIcon,
  WebhookIcon,
  PuzzleIcon,
  GitCommitIcon,
  GitPullRequestIcon,
  GitForkIcon,
  BinaryIcon,
  UnlinkIcon,
  PinOffIcon,
  ThumbsDownIcon,
  GripVerticalIcon,
  GripHorizontalIcon,
  ToggleRightIcon,
  CrosshairIcon,
  DotIcon,
  EqualIcon,
  UserCogIcon,
  CalendarPlusIcon,
  CalendarDaysIcon,
  CalendarXIcon,
  ReplyAllIcon,
};
